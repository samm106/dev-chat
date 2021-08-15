import { Loader, Dimmer } from "semantic-ui-react";

import React from "react";

const Spinner = () => {
  return (
    <Dimmer active>
      <Loader size="huge" content={"Preparing Chat....."} />
    </Dimmer>
  );
};

export default Spinner;
