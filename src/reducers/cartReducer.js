























export const initialCartState = {
  items: [],
};

export function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const itemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id,
      );

      if (itemIndex > -1) {
        const updatedItems = state.items.map((item, index) =>
          index === itemIndex ? { ...item, quantity: item.quantity + 1 } : item,
        );

        return { ...state, items: updatedItems };
      } else {
        const newItem = {
          ...action.payload,
          quantity: 1,
        };
        return { ...state, items: [...state.items, newItem] };
      }
    }
    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };
    }
    case "INCREASE_QUANTITY": {
      const itemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id,
      );

      if (itemIndex > -1) {
        const updatedItems = state.items.map((item, index) =>
          index === itemIndex ? { ...item, quantity: item.quantity + 1 } : item,
        );

        return { ...state, items: updatedItems };
      }
      return state;
    }

    case "DECREASE_QUANTITY": {
      const itemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id,
      );
      if (itemIndex > -1) {
        const updatedItems = state.items.map((item, index) =>
          index === itemIndex && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        );
        return { ...state, items: updatedItems };
      }
      return state;
    }
    case "CLEAR_CART": {
      return { ...state, items: [] };
    }
    default:
      return state;
  }
}

// type CartItem = {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
// };

// type CartState = {
//   items: CartItem[];
// };

// type CartAction =
//   | { type: "ADD_ITEM"; payload: { id: string; name: string; price: number } }
//   | { type: "REMOVE_ITEM"; payload: { id: string } }
//   | { type: "INCREASE_QUANTITY"; payload: { id: string } }
//   | { type: "DECREASE_QUANTITY"; payload: { id: string } }
//   | { type: "CLEAR_CART" };

// export const initialCartState: CartState = {
//   items: [],
// };

// export function cartReducer(state: CartState, action: CartAction): CartState {
//   switch (action.type) {
//     case "ADD_ITEM": {
//       const existingItemIndex = state.items.findIndex(
//         (item) => item.id === action.payload.id,
//       );

//       if (existingItemIndex > -1) {
//         const updatedItems = state.items.map((item, index) =>
//           index === existingItemIndex
//             ? { ...item, quantity: item.quantity + 1 }
//             : item,
//         );
//         return { ...state, items: updatedItems };
//       }

//       return {
//         ...state,
//         items: [...state.items, { ...action.payload, quantity: 1 }],
//       };
//     }

//     case "REMOVE_ITEM": {
//       return {
//         ...state,
//         items: state.items.filter((item) => item.id !== action.payload.id),
//       };
//     }

//     case "INCREASE_QUANTITY": {
//       return {
//         ...state,
//         items: state.items.map((item) =>
//           item.id === action.payload.id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item,
//         ),
//       };
//     }

//     case "DECREASE_QUANTITY": {
//       return {
//         ...state,
//         items: state.items
//           .map((item) =>
//             item.id === action.payload.id
//               ? { ...item, quantity: item.quantity - 1 }
//               : item,
//           )
//           .filter((item) => item.quantity > 0),
//       };
//     }

//     case "CLEAR_CART": {
//       return initialCartState;
//     }

//     default:
//       return state;
//   }
// }
