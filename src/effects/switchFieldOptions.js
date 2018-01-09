import createField from './createField';
import chooseFieldEffect, {
  OPERATION_ADD,
  OPERATION_REMOVE,
  OPERATION_MODIFY,
  OPERATION_FINISH,
  OPERATION_CANCEL,
} from './chooseFieldEffect';
import modifyField from './modifyField';
import removeField from './removeField';

export default function* switchFieldOptions({ fields, objectName }) {
  let state = fields.slice();
  const option = yield chooseFieldEffect({ fields: state });

  const isFinished = option === OPERATION_FINISH;
  const isCancelled = [OPERATION_FINISH, OPERATION_CANCEL].includes(option);

  const getResult = result => {
    return {
      fields: result,
      isFinished,
      isCancelled,
    };
  };

  switch (option) {
    case OPERATION_ADD:
      return getResult(yield createField(state, { objectName }));
    case OPERATION_REMOVE:
      return getResult(yield removeField(state));
    case OPERATION_MODIFY:
      return getResult(yield modifyField(state, { objectName }));
  }

  return getResult(state);
}
