import chalk from 'chalk';
import inquire from './inquire';
import fieldPicker from './fieldPicker';
import waitForAnswerTo from './waitForAnswerTo';
import { success } from '../lib/output';

export const CONFIRM_FIELD_REMOVAL = Symbol();

export default function* removeField(fields) {
  const fieldName = yield fieldPicker(fields);
  if (fieldName) {
    yield inquire(CONFIRM_FIELD_REMOVAL, {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to remove "${chalk.magenta(fieldName)}"?`,
    });

    const { confirm } = yield waitForAnswerTo(CONFIRM_FIELD_REMOVAL);

    if (confirm) {
      success(`Removed field ${fieldName}`);
      return fields.filter(({ name }) => name !== fieldName);
    }
  }

  return fields;
}
