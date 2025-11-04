// Initialize config object
window.config = {
    colors: {
        primary: window.Helpers ? window.Helpers.getCssVar("primary") : '#696cff',
        secondary: window.Helpers ? window.Helpers.getCssVar("secondary") : '#8592a3',
        success: window.Helpers ? window.Helpers.getCssVar("success") : '#71dd37',
        info: window.Helpers ? window.Helpers.getCssVar("info") : '#03c3ec',
        warning: window.Helpers ? window.Helpers.getCssVar("warning") : '#ffab00',
        danger: window.Helpers ? window.Helpers.getCssVar("danger") : '#ff3e1d',
        dark: window.Helpers ? window.Helpers.getCssVar("dark") : '#233446',
        black: window.Helpers ? window.Helpers.getCssVar("pure-black") : '#000',
        white: window.Helpers ? window.Helpers.getCssVar("white") : '#fff',
        cardColor: window.Helpers ? window.Helpers.getCssVar("paper-bg") : '#fff',
        bodyBg: window.Helpers ? window.Helpers.getCssVar("body-bg") : '#f5f5f9',
        bodyColor: window.Helpers ? window.Helpers.getCssVar("body-color") : '#697a8d',
        headingColor: window.Helpers ? window.Helpers.getCssVar("heading-color") : '#566a7f',
        textMuted: window.Helpers ? window.Helpers.getCssVar("secondary-color") : '#a1acb8',
        borderColor: window.Helpers ? window.Helpers.getCssVar("border-color") : '#d9dee3'
    },
    colors_label: {
        primary: window.Helpers ? window.Helpers.getCssVar("primary-bg-subtle") : '#f3f4ff',
        secondary: window.Helpers ? window.Helpers.getCssVar("secondary-bg-subtle") : '#f4f5f7',
        success: window.Helpers ? window.Helpers.getCssVar("success-bg-subtle") : '#f1f9e8',
        info: window.Helpers ? window.Helpers.getCssVar("info-bg-subtle") : '#e7f9fc',
        warning: window.Helpers ? window.Helpers.getCssVar("warning-bg-subtle") : '#fff5e6',
        danger: window.Helpers ? window.Helpers.getCssVar("danger-bg-subtle") : '#ffe5e3',
        dark: window.Helpers ? window.Helpers.getCssVar("dark-bg-subtle") : '#ebeef1'
    },
    fontFamily: window.Helpers ? window.Helpers.getCssVar("font-family-base") : 'Inter, sans-serif',
    enableMenuLocalStorage: true
};

// Safely get template attributes with fallbacks
window.assetsPath = document.documentElement.getAttribute("data-assets-path") || "/assets/";
window.templateName = document.documentElement.getAttribute("data-template") || "vertical-menu-theme-default-light";

// Initialize template customizer with error handling
if (typeof TemplateCustomizer !== "undefined") {
    try {
        window.templateCustomizer = new TemplateCustomizer({
            displayCustomizer: true,
            lang: localStorage.getItem("templateCustomizer-" + window.templateName + "--Lang") || "en",
            controls: ["color", "theme", "skins", "semiDark", "layoutCollapsed", "layoutNavbarOptions", "headerType", "contentLayout", "rtl"]
        });
    } catch (error) {
        console.warn("Template customizer initialization failed:", error);
    }
}