const User = require("../../models/user");

async function ensureUser(message) {
    const rawId = message.author || message.from;
    const userId = rawId.split("@")[0];
    const user = await User.getByPhone(userId);

    if (!user) {
        await message.reply("Kamu belum memulai permainan! Ketik */start* untuk memulai.");
        return null;
    }

    return user;
}

module.exports = { ensureUser };
