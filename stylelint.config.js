export default {
  extends: ['stylelint-config-standard', 'stylelint-config-recess-order'],
  rules: {
    // Custom properties in this project use `--category-color` etc. —
    // the standard pattern is fine, but turn off the strict kebab-only check
    // in case you add a numeric or single-char suffix later.
    'custom-property-pattern': null,

    // Your class names (.shell, .card, .question-card) are already kebab-case,
    // but BEM-style suffixes like `__title` and `--active` would trip the
    // default pattern. Disable unless you want to enforce BEM strictly.
    'selector-class-pattern': null,

    // Disable strict ordering conflicts that appear when combining
    // stylelint-config-standard with recess-order. The recess config
    // intentionally reorders some properties, and this rule then complains.
    'declaration-block-no-redundant-longhand-properties': null,
  },
}
