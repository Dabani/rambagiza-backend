
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { LanguageDetector, handle } from "i18next-http-middleware";

class I18nManager {
  t;
  init = ({ app } = {}) => {
    i18next.use(Backend)
      .use(LanguageDetector)
      .init({
        backend: {
          loadPath: "locales/{{lng}}/translation.json",
        },
        fallbackLng: "en",
        preload: [ "en", "fr", "kn" ],
      })
      .then((_t) => (this.t = _t));

    if (app) app.use(handle(i18next));
  };
}

const i18n = new I18nManager();

export default {
  i18n,
  t: (...args) => i18n.t(...args),
};