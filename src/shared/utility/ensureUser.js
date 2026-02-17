async function ensureUser(message, User) {
    const phoneId = message.from.split("@")[0];
    const user = await User.getByPhone(phoneId);

    if (!user) {
        await message.reply("Kamu belum memulai permainan! Ketik */start* untuk memulai.");
        return null;
    }

    return user;
}

module.exports = { ensureUser };