const { MessageMedia } = require("whatsapp-web.js");
const Card = require("../../models/card");
const path = require("path");
const { ensureUser } = require("../../shared/utility/ensureUser");
const UserCards = require("../../models/user_cards");
const { applyFee } = require("../../shared/utility/fee");
const User = require("../../models/user");

function formatNumber(value) {
    return Number(value || 0).toLocaleString("id-ID");
}

function getRarityEmoji(rarity) {
    const map = {
        n: "⚪",
        r: "🔵",
        sr: "🟣",
        ssr: "🟡",
        ur: "🔴",
        lr: "🌟",
    };
    return map[rarity?.toLowerCase()] || "❓";
}

function getCardFeeRate() {
    const raw = Number(process.env.FEE_CARD_RATE ?? process.env.FEE_RATE);
    return Number.isFinite(raw) && raw >= 0 ? raw : 0.01;
}

function getFeeBoundaries() {
    const feeMin = process.env.MINIMUN_FEE ? parseInt(process.env.MINIMUN_FEE, 10) : 1;
    const feeMax = process.env.MAXIMUM_FEE ? parseInt(process.env.MAXIMUM_FEE, 10) : Infinity;
    return { feeMin, feeMax };
}

module.exports = {
    name: "card",
    description: "Menjelajahi dan membeli kartu di card shop menggunakan chix.",
    aliases: ["cardshop", "cshop", "cstore", "cmarket"],

    /**
     * @param {import("whatsapp-web.js").Message} message
     * @param {import("whatsapp-web.js").Client} client
     * @param {string[]} args
     */
    async execute(message, client, args) {
        const user = await ensureUser(message);
        if (!user) return;

        const prefix = process.env.PREFIX || "!";
        const subcommand = args[0]?.toLowerCase();

        if (!subcommand) {
            return await message.reply(
                `Gunakan subcommand:\n` +
                    `• \`${prefix}card list\` - Lihat semua kartu\n` +
                    `• \`${prefix}card buy <id>\` - Beli kartu\n` +
                    `• \`${prefix}card info <id>\` - Detail kartu\n` +
                    `• \`${prefix}card mycard\` - Kartu milikmu`,
            );
        }

        switch (subcommand) {
            case "list":
            case "l": {
                const cards = await Card.list();
                if (!cards || cards.length === 0) {
                    return await message.reply("🃏 Card shop kosong saat ini!");
                }

                const lines = ["🃏 *Card Shop* 🃏", ""];
                for (const card of cards) {
                    const emoji = getRarityEmoji(card.rarity);
                    lines.push(`[${card.id}] ${emoji} *${card.name}*`);
                    lines.push(`Rarity: ${card.rarity.toUpperCase()} | ⚡ Power: ${card.power}`);
                    lines.push(`💰 ${formatNumber(card.price)} Chix`);
                    lines.push("");
                }
                lines.push(`Gunakan \`${prefix}card buy <id>\` untuk membeli`);
                lines.push(`Gunakan \`${prefix}card info <id>\` untuk lihat kartu`);
                return await message.reply(lines.join("\n"));
            }

            case "info":
            case "i": {
                const cardId = Number(args[1]);
                if (!cardId) return await message.reply(`❌ Masukkan ID kartu!\nContoh: \`${prefix}card info 1\``);

                const card = await Card.getById(cardId);
                if (!card) return await message.reply("❌ Kartu tidak ditemukan!");

                const emoji = getRarityEmoji(card.rarity);
                const media = MessageMedia.fromFilePath(path.join(__dirname, "../../..", card.stickerPath));

                await client.sendMessage(message.from, media, { sendMediaAsSticker: true });
                return await message.reply(
                    `${emoji} *${card.name}*\n\n` +
                        `🏷️ Rarity: *${card.rarity.toUpperCase()}*\n` +
                        `⚡ Power: *${card.power}*\n` +
                        `✨ Efek: ${card.effect}\n` +
                        `💰 Harga: *${formatNumber(card.price)} Chix*\n\n` +
                        `Gunakan \`${prefix}card buy ${card.id}\` untuk membeli`,
                );
            }

            case "buy":
            case "b": {
                const cardId = Number(args[1]);
                if (!cardId) return await message.reply(`❌ Masukkan ID kartu!\nContoh: \`${prefix}card buy 1\``);

                const card = await Card.getById(cardId);
                if (!card) return await message.reply("❌ Kartu tidak ditemukan!");

                const { feeMin, feeMax } = getFeeBoundaries();
                const feeRate = getCardFeeRate();
                const { fee } = applyFee(card.price, feeRate, { minFee: feeMin, maxFee: feeMax });
                const total = card.price + fee;

                if (user.chix < total) {
                    return await message.reply(
                        `❌ Chix tidak cukup!\n\n` +
                            `🃏 Kartu: *${card.name}*\n` +
                            `💰 Harga: ${formatNumber(card.price)} Chix\n` +
                            `🏷️ Fee: ${formatNumber(fee)} Chix\n` +
                            `📊 Total: ${formatNumber(total)} Chix\n` +
                            `💳 Kamu punya: ${formatNumber(user.chix)} Chix`,
                    );
                }

                // Kurangi chix & tambah kartu ke user
                await User.update(user.id, { chix: user.chix - total });
                await UserCards.addToUserCards(user.id, card.id);

                // Kirim sticker kartu
                const media = MessageMedia.fromFilePath(path.join(__dirname, "../../..", card.stickerPath));
                await client.sendMessage(message.from, media, { sendMediaAsSticker: true });

                return await message.reply(
                    `✅ *Pembelian Berhasil!*\n\n` +
                        `🃏 *${card.name}*\n` +
                        `⭐ Rarity: *${card.rarity.toUpperCase()}*\n` +
                        `⚡ Power: *${card.power}*\n` +
                        `✨ Efek: ${card.effect}\n\n` +
                        `💰 Harga: ${formatNumber(card.price)} Chix\n` +
                        `🏷️ Fee: ${formatNumber(fee)} Chix\n` +
                        `📊 Total: ${formatNumber(total)} Chix\n` +
                        `💳 Sisa saldo: *${formatNumber(user.chix - total)} Chix*`,
                );
            }

            case "mycard":
            case "mc": {
                const userCards = await UserCards.getAllByUser(user.id);
                if (!userCards || userCards.length === 0) {
                    return await message.reply(
                        `❌ Kamu belum punya kartu!\n` + `Gunakan \`${prefix}card buy <id>\` untuk membeli.`,
                    );
                }

                const lines = [`🃏 *Kartu Milikmu* 🃏`, ""];
                for (const uc of userCards) {
                    const emoji = getRarityEmoji(uc.rarity);
                    lines.push(`${emoji} *${uc.card_name}* (x${uc.quantity})`);
                    lines.push(`Rarity: ${uc.rarity.toUpperCase()} | ⚡ ${uc.power}`);
                    lines.push("");
                }
                return await message.reply(lines.join("\n"));
            }

            default:
                return await message.reply(
                    `❌ Subcommand tidak dikenal!\n` + `Gunakan: \`list\`, \`info\`, \`buy\`, \`mycard\``,
                );
        }
    },
};
