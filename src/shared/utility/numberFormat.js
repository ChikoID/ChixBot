function formatNumber(num, type = "full", digits = 1) {
    if (num === null || num === undefined || isNaN(num)) return "0";

    if (type === "full") {
        return new Intl.NumberFormat("id-ID").format(num);
    }

    if (type === "short") {
        const units = [
            { value: 1e33, symbol: "Dc" }, // decillion
            { value: 1e30, symbol: "No" }, // nonillion
            { value: 1e27, symbol: "Oc" }, // octillion
            { value: 1e24, symbol: "Sp" }, // septillion
            { value: 1e21, symbol: "Sx" }, // sextillion
            { value: 1e18, symbol: "Qi" }, // quintillion
            { value: 1e15, symbol: "Qa" }, // quadrillion
            { value: 1e12, symbol: "T" }, // trillion
            { value: 1e9, symbol: "B" }, // billion
            { value: 1e6, symbol: "M" }, // million
            { value: 1e3, symbol: "K" }, // thousand
        ];

        const absNum = Math.abs(num);

        for (const unit of units) {
            if (absNum >= unit.value) {
                const formatted = (num / unit.value).toFixed(digits).replace(/\.0+$/, "") + unit.symbol;

                return formatted;
            }
        }

        return num.toString();
    }
}

module.exports = { formatNumber };
