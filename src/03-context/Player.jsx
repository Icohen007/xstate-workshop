import { createMachine, assign } from 'xstate';
import { raise } from 'xstate/lib/actions';
import { useMachine } from '@xstate/react';
import { useEffect } from 'react';
import { formatTime } from '../formatTime';

const playerMachine = createMachine({
  initial: 'loading',
  context: {
    // Add initial context here for:
    // title, artist, duration, elapsed, likeStatus, volume
    title: 'Shallow',
    artist: 'Lady Gaga',
    duration: 500,
    elapsed: 0,
    likeStatus: 'unliked',
    volume: 0
  },
  states: {
    loading: {
      on: {
        LOADED: {
          actions: 'assignSongData',
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
      entry: 'playAudio',
      exit: 'pauseAudio',
      on: {
        PAUSE: { target: 'paused' },
      },
    },
  },
  on: {
    SKIP: {
      actions: 'skipSong',
      target: 'loading',
    },
    LIKE: {
      actions: 'likeSong',
    },
    UNLIKE: {
      actions: 'unlikeSong',
    },
    DISLIKE: {
      actions: ['dislikeSong', raise('SKIP')],
    },
    VOLUME: {
      actions: 'assignVolume',
    },
    'AUDIO.TIME': {
      actions: 'assignTime',
    },
  },
}).withConfig({
  actions: {
    assignSongData: assign({
      title: (type, event) => event.data.title,
      artist: (type, event) => event.data.artist,
      duration: (type, event) => event.data.duration,
      elapsed: 0,
      likeStatus: 'unliked',
    }),
    likeSong: assign({
      likeStatus: 'liked'
    }),
    unlikeSong: assign({
      likeStatus: 'unliked'
    }),
    dislikeSong: assign({
      likeStatus: 'disliked'
    }),
    assignVolume: assign({
      volume: (type, event) => event.level
    }),
    assignTime: assign({
      elapsed: (type, event) => event.currentTime
    }),
    skipSong: () => {
      console.log('Skipping song');
    },
    playAudio: () => {},
    pauseAudio: () => {},
  },
});

export function Player() {
  const [state, send] = useMachine(playerMachine);
  const { context } = state;

  useEffect(() => {
    const i = setTimeout(() => {
      send({
        type: 'LOADED',
        data: {
          title: 'Starship',
          artist: 'Nicky Minaj',
          duration: 100,
        },
      });
    }, 1000);

    return () => {
      clearTimeout(i);
    };
  }, []);

  return (
    <div id="player">
      <div className="song">
        <div className="title">{context.title ?? <>&nbsp;</>}</div>
        <div className="artist">{context.artist ?? <>&nbsp;</>}</div>
        <input
          type="range"
          id="scrubber"
          min="0"
          max={context.duration}
          value={context.elapsed}
          onChange={(event) => send({type: 'AUDIO.TIME', currentTime: event.target.value})}
        />
        <output id="elapsed">
          {formatTime(context.elapsed - context.duration)}
        </output>
      </div>
      <div className="controls">
        <button
          id="button-like"
          onClick={() => send({ type: 'LIKE' })}
          data-like-status={context.likeStatus}
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
        {state.matches('loading') && <button id="button-loading"></button>}
        <button
          id="button-skip"
          onClick={() => send({ type: 'SKIP' })}
        ></button>
        <button onClick={() => send({type: 'VOLUME', level: 10})}
          id="button-volume"
          data-level={
            context.volume === 0
              ? 'zero'
              : context.volume <= 2
              ? 'low'
              : context.volume >= 8
              ? 'high'
              : undefined
          }
        ></button>
      </div>
    </div>
  );
}
