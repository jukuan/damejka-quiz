import { t } from '../i18n'
export default function UnscrambleInput({ lang, scrambled, value, disabled, onChange, onSubmit }) {
  return <div className="unscramble"><div className="scrambled">{scrambled}</div><input value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && onSubmit()} placeholder={t(lang, 'answerPlaceholder')} aria-label={t(lang, 'yourAnswer')} autoFocus /></div>
}
