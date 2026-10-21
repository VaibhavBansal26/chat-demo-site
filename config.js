// Runtime settings. The deploy workflow overwrites this file from the repository variables
// CONVERSATIONS_URL and WIDGET_TOKEN. The widget token is public by design (it is visible in any page that embeds the
// widget) and only works on the domain it was created for, but keep it out of the code anyway so it is easy to change.
window.SITE_CONFIG = {
  conversationsUrl: "https://conversations-app-jrvx.onrender.com",
  widgetToken: "",
};
