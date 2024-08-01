import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
    colors: {
        blue: {
            100: "#002341",
            95: "#00305c",
            90: "#01417b",
            80: "#0b62c5",
            70: "#1a77e9",
            60: "#2c96ff",
            50: "#00aaff",
            40: "#78c2ff",
            30: "#97d1ff",
            20: "#afddff",
            15: "#cfebff",
            10: "#e6f2fa",
            5: "#f2f9fc",
        },
        gold: {
            100: "#665300",
            90: "#7c6500",
            80: "#927704",
            70: "#a88a08",
            60: "#bd9e16",
            50: "#debc2a",
            40: "#f7d64a",
            30: "#ffe470",
            20: "#ffe98c",
            15: "#ffefa8",
            10: "#fff4c6",
            5: "#fffae3",
        },
    },
    fonts: {
        heading: "Museo Slab, Arial, sans-serif",
        body: "Museo Sans, Arial, sans-serif",
    },
    components: {
        Heading: {
            baseStyle: {
                fontWeight: 500,
            },
        },
        Text: {
            baseStyle: {
                fontWeight: 300,
            },
        },
    },
});

export default theme;