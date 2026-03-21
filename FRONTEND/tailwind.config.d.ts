declare const _default: {
    content: string[];
    theme: {
        extend: {
            colors: {
                ash: string;
                soot: string;
                cinder: string;
                rust: string;
                ember: string;
                brass: string;
                bone: string;
                parchment: string;
            };
            boxShadow: {
                casket: string;
                insetWear: string;
            };
            backgroundImage: {
                hatch: string;
                dust: string;
            };
            animation: {
                swaySlow: string;
                emberPulse: string;
                dustShift: string;
            };
            keyframes: {
                swaySlow: {
                    '0%, 100%': {
                        transform: string;
                    };
                    '50%': {
                        transform: string;
                    };
                };
                emberPulse: {
                    '0%, 100%': {
                        opacity: string;
                        transform: string;
                    };
                    '50%': {
                        opacity: string;
                        transform: string;
                    };
                };
                dustShift: {
                    '0%': {
                        transform: string;
                    };
                    '50%': {
                        transform: string;
                    };
                    '100%': {
                        transform: string;
                    };
                };
            };
        };
    };
    plugins: any[];
};
export default _default;
