import {createMachine, assign, interpret, send} from 'xstate';
import {useMachine} from '@xstate/react';
import {inspect} from '@xstate/inspect';
import {useEffect} from 'react';

inspect({
  iframe: false
})

const playerMachine = createMachine({
  initial: 'loading',
  states: {
    paused: {
      on: {
        PLAY: {target: 'playing'},
      }
    },
    loading: {
      on: {
        LOADED: {target: 'paused'},
      }
    },
    playing: {
      on: {
        PAUSE: {target: 'paused'},
      }
    },
  }
});

export function Player() {
  const [state, send] = useMachine(playerMachine, {devTools: true});

  useEffect(() => {
    const i = setTimeout(() => {
      send({type: 'LOADED'});
    }, 1000);

    return () => {
      clearTimeout(i);
    };
  }, []);

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
          {state.matches('paused') && (
              <button
                  id="button-play"
                  onClick={() => send({type: 'PLAY'})}
              ></button>
          )}
          {state.matches('playing') && (
              <button
                  id="button-pause"
                  onClick={() => {
                    send({type: 'PAUSE'});
                  }}
              ></button>
          )}
          {state.matches('loading') && <button id="button-loading"></button>}
          <button id="button-skip"></button>
          <button id="button-volume"></button>
        </div>
      </div>
  );
}
