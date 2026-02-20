const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const sharp = require("sharp");
const multer = require("multer");
const Card = require("../../src/models/card");

const upload = multer({ storage: multer.memoryStorage() });
const output_dir = path.join(__dirname, "../../assets/stickers/cards");

if (!fs.existsSync(output_dir)) {
    fs.mkdirSync(output_dir, { recursive: true });
}

const uploadMiddleware = upload.single("stickerPath");

const processImage = async (file) => {
    const fileName = Date.now() + "-" + file.originalname.replace(/\.[^/.]+$/, "") + ".webp";
    const outputPath = path.join(output_dir, fileName);
    await sharp(file.buffer).webp({ quality: 90 }).toFile(outputPath);
    return `/assets/stickers/cards/${fileName}`;
};

const toNumber = (val) => Number(val) || 0;

const renderView = (viewName, data = {}) => {
    const viewPath = path.join(__dirname, "../views", `${viewName}.ejs`);
    const template = fs.readFileSync(viewPath, "utf8");
    return ejs.render(template, data);
};

const rarities = [
    { value: "n", label: "N • Normal" },
    { value: "r", label: "R • Rare" },
    { value: "sr", label: "SR • Super Rare" },
    { value: "ssr", label: "SSR • Super Super Rare" },
    { value: "ur", label: "UR • Ultra Rare" },
    { value: "lr", label: "LR • Legendary Rare" },
];

class CardsController {
    static async renderCards(req, res) {
        const cards = await Card.list();
        const body = renderView("dashboard/cards", {
            rarities,
            cards,
            editCard: null,
            error: req.query.error || "",
            success: req.query.success || "",
        });
        return res.render("layouts/admin", { title: "Cards", body });
    }

    static async renderEdit(req, res) {
        const id = Number(req.params.id);
        const editCard = await Card.getById(id);

        if (!editCard) {
            return res.redirect("/cards?error=Card%20tidak%20ditemukan");
        }

        const cards = await Card.list();
        const body = renderView("dashboard/cards", {
            rarities,
            cards,
            editCard,
            error: req.query.error || "",
            success: req.query.success || "",
        });
        return res.render("layouts/admin", { title: "Cards", body });
    }

    static createCards = [
        uploadMiddleware,
        async (req, res) => {
            const { name, price, rarity, power, effect } = req.body || {};
            const parsedPrice = toNumber(price);
            const parsedPower = toNumber(power);

            if (!name || !price || !rarity || !power || !effect || !req.file) {
                return res.redirect("/cards?error=Data%20card%20tidak%20valid");
            }

            try {
                const stickerPath = await processImage(req.file);
                await Card.create(
                    String(name).trim(),
                    parsedPrice,
                    String(rarity).trim(),
                    parsedPower,
                    String(effect).trim(),
                    stickerPath,
                );
                return res.redirect("/cards?success=Card%20berhasil%20ditambahkan");
            } catch (err) {
                console.error(err);
                return res.redirect("/cards?error=Gagal%20menambahkan%20cards");
            }
        },
    ];

    static updateCards = [
        uploadMiddleware,
        async (req, res) => {
            const id = Number(req.params.id);
            const { name, price, rarity, power, effect } = req.body || {};
            const parsedPrice = toNumber(price);
            const parsedPower = toNumber(power);

            if (!id || !name || !price || !rarity || !power || !effect) {
                return res.redirect("/cards?error=Data%20card%20tidak%20valid");
            }

            try {
                let stickerPath;

                if (req.file) {
                    // Upload gambar baru, hapus yang lama
                    const existingCard = await Card.getById(id);
                    if (existingCard?.stickerPath) {
                        const oldFile = path.join(__dirname, "../../", existingCard.stickerPath);
                        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
                    }
                    stickerPath = await processImage(req.file);
                } else {
                    // Tidak upload baru, pakai yang lama
                    const existingCard = await Card.getById(id);
                    stickerPath = existingCard?.stickerPath || "";
                }

                await Card.update(
                    id,
                    String(name).trim(),
                    parsedPrice,
                    String(rarity).trim(),
                    parsedPower,
                    String(effect).trim(),
                    stickerPath,
                );
                return res.redirect("/cards?success=Card%20berhasil%20diedit");
            } catch (err) {
                console.error(err);
                return res.redirect("/cards?error=Gagal%20mengedit%20cards");
            }
        },
    ];

    static async deleteCards(req, res) {
        const id = Number(req.params.id);
        if (!id) {
            return res.redirect("/cards?error=Data%20card%20tidak%20valid");
        }

        try {
            // Hapus file gambar sekalian
            const existingCard = await Card.getById(id);
            if (existingCard?.stickerPath) {
                const oldFile = path.join(__dirname, "../../", existingCard.stickerPath);
                if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
            }
            await Card.delete(id);
            return res.redirect("/cards?success=Card%20berhasil%20dihapus");
        } catch (err) {
            console.error(err);
            return res.redirect("/cards?error=Gagal%20menghapus%20cards");
        }
    }
}

module.exports = CardsController;
