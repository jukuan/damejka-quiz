import { t } from '../i18n'

export default function Brand({ lang = 'be' }) {
  return (
    <div className="brand">
      <div className="mark">Д</div>
      <div>
        <small>{t(lang, 'appKicker')}</small>
        <h1>Дамейка</h1>
      </div>
    </div>
  )
}
