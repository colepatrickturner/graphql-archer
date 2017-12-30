import { COMMAND_GENERATE_ENTITY } from "graphql-archer/src/commands/generate/action";
import generateEntitySaga from "./generateEntity";
import chooseServerToScaffoldSaga from "./chooseServer";
import { SCAFFOLD_PROJECT } from "graphql-archer/src/commands/create/saga";
import { takeEvery } from "graphql-archer/src/effects";

export default function*() {
  yield [
    takeEvery(SCAFFOLD_PROJECT, chooseServerToScaffoldSaga),
    takeEvery(COMMAND_GENERATE_ENTITY, generateEntitySaga),
  ];
}
