import {useEffect} from 'react';
import {useReducer} from 'react';

const initialState = {
  value: 'loading', // or 'playing' or 'paused'
};

const machineDefinition = {
  states: {
    paused: {
      on: {
        play: 'playing',
        skip: 'loading'
      }
    },
    loading: {
      on: {
        pause: 'paused',
        LOADED: 'paused',
        skip: 'loading'
      }
    },
    playing: {
      on: {
        pause: 'paused',
        skip: 'loading'
      }
    },
  }
}

function playerMachine(state, event) {
  const stateDefinition = machineDefinition.states[state.value];
  const nextStateValue = stateDefinition?.on[event.type] ?? state.value;

  return {...state, value: nextStateValue};
}

export function Player() {
  const [state, send] = useReducer(playerMachine, initialState);

  console.log(state);

  useEffect(() => {

    if (state.value !== 'loading') {
      return;
    }
    const i = setTimeout(() => {
      send({type: 'LOADED'});
    }, 1000);

    return () => {
      clearTimeout(i);
    };
  }, [state.value]);

  return (
      <div id="player">
        <div className="song">
          <div className="title">
            <em>Song Title</em>
          </div>
          <div className="artist">
            <em>Artist</em>
          </div>
          <input type="range" id="scrubber" min="0" max="0"/>
          <output id="elapsed"></output>
        </div>
        <div className="controls">
          <button id="button-like"></button>
          <button id="button-dislike"></button>
          {state.value === 'paused' && (
              <button
                  id="button-play"
                  onClick={() => {
                    send({type: 'play'});
                  }}
              ></button>
          )}
          {state.value === 'playing' && (
              <button
                  id="button-pause"
                  onClick={() => {
                    send({type: 'pause'})
                  }}
              ></button>
          )}
          {state.value === 'loading' && <button id="button-loading"></button>}
          <button id="button-skip" onClick={() => {
            send({type: 'skip'})
          }}></button>
          <button id="button-volume"></button>
        </div>
      </div>
  );
}
