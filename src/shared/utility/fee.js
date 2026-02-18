function applyFee(amount, rate, { minFee = 1, maxFee = Infinity } = {}) {
    const rawFee = Math.floor(amount * rate);
    const fee = Math.max(minFee, Math.min(maxFee, rawFee));
    const net = Math.max(0, amount - fee);
    return { gross: amount, fee, net, rate };
}

module.exports = {
    applyFee,
};
