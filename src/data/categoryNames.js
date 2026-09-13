export const categoryNames = {
  be: {
    physics: 'Фізіка',
    chemistry: 'Хімія',
    biology: 'Біялогія',
    astronomy: 'Астраномія',
    religion: 'Рэлігія і міфалогія',
    linguistics: 'Лінгвістыка',
    informatics: 'Інфарматыка і ІТ',
  },
  en: {
    physics: 'Physics',
    chemistry: 'Chemistry',
    biology: 'Biology',
    astronomy: 'Astronomy',
    religion: 'Religion & Mythology',
    linguistics: 'Linguistics',
    informatics: 'Computer Science & IT',
  },
  ru: {
    physics: 'Физика',
    chemistry: 'Химия',
    biology: 'Биология',
    astronomy: 'Астрономия',
    religion: 'Религия и мифология',
    linguistics: 'Лингвистика',
    informatics: 'Информатика и ИТ',
  },
  es: {
    physics: 'Física',
    chemistry: 'Química',
    biology: 'Biología',
    astronomy: 'Astronomía',
    religion: 'Religión y mitología',
    linguistics: 'Lingüística',
    informatics: 'Informática y TI',
  },
  de: {
    physics: 'Physik',
    chemistry: 'Chemie',
    biology: 'Biologie',
    astronomy: 'Astronomie',
    religion: 'Religion & Mythologie',
    linguistics: 'Linguistik',
    informatics: 'Informatik & IT',
  },
  uk: {
    physics: 'Фізика',
    chemistry: 'Хімія',
    biology: 'Біологія',
    astronomy: 'Астрономія',
    religion: 'Релігія та міфологія',
    linguistics: 'Лінгвістика',
    informatics: 'Інформатика та ІТ',
  },
}

export function categoryName(lang, id, fallback) {
  return categoryNames[lang]?.[id] ?? fallback
}
