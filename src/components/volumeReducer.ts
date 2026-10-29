type volumeState = {
  volume: number;
};

type volumeAction =
  | { type: "SET_VOLUME"; payload: { value: number } }
  | { type: "MUTE" };

export const initialVolumeState: volumeState = {
  volume: 50,
};

function volumeReducer(state: volumeState, action: volumeAction): volumeState {
  switch (action.type) {
    case "SET_VOLUME":
      return {
        ...state,
        volume: action.payload.value,
      };

    case "MUTE":
      return {
        ...state,
        volume: 0,
      };

    default:
      return state;
  }
}

export default volumeReducer;
