import { dict } from "@/utils/dict";
import React from "react";

function Test() {
  const text = dict["en"];

  return (
    <div>
      {text.Actions.add}
      {text.Actions.clear}
      {text.Actions.clean}
      {text.Actions.confirm}
      {text.Actions.close}
    </div>
  );
}

export default Test;
