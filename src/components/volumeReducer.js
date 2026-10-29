







export const initialVolumeState = {
  volume: 50,
};

function volumeReducer(state, action) {
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
