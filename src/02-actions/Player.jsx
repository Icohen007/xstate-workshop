import { createMachine } from 'xstate';
import { raise } from 'xstate/lib/actions';
import { useMachine } from '@xstate/react';
import { useEffect } from 'react';

const playerMachine = createMachine({
  initial: 'loading',
  states: {
    loading: {
      on: {
        LOADED: {
          // Add an action here to assign the song data
          actions: 'loadSongData',
          target: 'playing',
        },
      },
    },
    paused: {
      on: {
        PLAY: { target: 'playing' },
      },
    },
    playing: {
      // When this state is entered, add an action to play the audio
      // When this state is exited, add an action to pause the audio
      entry: 'playAudio',
      exit: 'pauseAudio',
      on: {
        PAUSE: { target: 'paused' },
      },
    },
  },
  on: {
    SKIP: {
      // Add an action to skip the song
      target: 'loading',
      actions: 'skipSong'
    },
    LIKE: {
      // Add an action to like the song
      actions: 'likeSong'
    },
    UNLIKE: {
      // Add an action to unlike the song
      actions: 'unlikeSong'
    },
    DISLIKE: {
      // Add two actions to dislike the song and raise the skip event
      actions: ['dislikeSong', raise('SKIP')]
    },
    VOLUME: {
      // Add an action to assign to the volume
      actions: 'assignVolume'
    },
  },
}).withConfig({
  actions: {
    loadSongData: () => { console.log('loadSongData')},
    playAudio: () => { console.log('playAudio')},
    pauseAudio: () => { console.log('pauseAudio')},
    skipSong: () => { console.log('skipSong')},
    likeSong: () => { console.log('likeSong')},
    unlikeSong: () => { console.log('unlikeSong')},
    dislikeSong: () => { console.log('dislikeSong')},
    assignVolume: () => { console.log('assignVolume')},
    // Add implementations for the actions here, if you'd like
    // For now you can just console.log something
  },
});

export function Player() {
  const [state, send] = useMachine(playerMachine);

  useEffect(() => {
    const i = setTimeout(() => {
      send({ type: 'LOADED' });
    }, 1000);

    return () => {
      clearTimeout(i);
    };
  }, []);

  // console.log(state.actions);

  return (
    <div id="player">
      <div className="song">
        <div className="title">
          <em>Song Title</em>
        </div>
        <div className="artist">
          <em>Artist</em>
        </div>
        <input type="range" id="scrubber" min="0" max="0" />
        <output id="elapsed"></output>
      </div>
      <div className="controls">
        <button
          id="button-like"
          onClick={() => send({ type: 'LIKE' })}
        ></button>
        <button
          id="button-dislike"
          onClick={() => send({ type: 'DISLIKE' })}
        ></button>
        {state.matches('paused') && (
          <button
            id="button-play"
            onClick={() => send({ type: 'PLAY' })}
          ></button>
        )}
        {state.matches('playing') && (
          <button
            id="button-pause"
            onClick={() => {
              send({ type: 'PAUSE' });
            }}
          ></button>
        )}
        {state.value === 'loading' && <button id="button-loading"></button>}
        <button
          id="button-skip"
          onClick={() => send({ type: 'SKIP' })}
        ></button>
        <button id="button-volume" onClick={() => send({ type: 'VOLUME' })}></button>
      </div>
    </div>
  );
}
