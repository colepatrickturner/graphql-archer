import { call, inquire, waitForAnswerTo } from '../effects';

const INQUIRE_TRY_AGAIN = Symbol();

export default function tryAgain(
  options = { message: 'Would you like to try again?' }
) {
  const { message } = options;

  return call(function*() {
    yield inquire(INQUIRE_TRY_AGAIN, {
      type: 'confirm',
      name: 'tryAgain',
      message,
    });

    const { tryAgain } = yield waitForAnswerTo(INQUIRE_TRY_AGAIN);

    return tryAgain;
  });
}
