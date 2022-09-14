import {createMachine, assign} from 'xstate';
import {raise} from 'xstate/lib/actions';
import {useMachine} from '@xstate/react';
import {useEffect} from 'react';
import {formatTime} from '../formatTime';

const playerMachine = createMachine({
  initial: 'loading',
  context: {
    title: undefined,
    artist: undefined,
    duration: 0,
    elapsed: 0,
    likeStatus: 'unliked', // or 'liked' or 'disliked'
    volume: 5,
  },
  states: {
    loading: {
      tags: ['loading'],
      on: {
        LOADED: {
          actions: 'assignSongData',
          target: 'playing',
        },
      },
    },
    paused: {
      on: {
        PLAY: {target: 'playing'},
      },
    },
    playing: {
      entry: 'playAudio',
      exit: 'pauseAudio',
      on: {
        PAUSE: {target: 'paused'},
      },
      always: {
        cond: (context) => context.elapsed >= context.duration,
        target: 'paused'
      }
      // Add an eventless transition here that always goes to 'paused'
      // when `elapsed` value is >= the `duration` value
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
    'LIKE.TOGGLE': [
      {
        cond: (context) => context.likeStatus === 'liked',
        actions: [raise('UNLIKE')],
      },
      {
        cond: (context) => context.likeStatus === 'unliked',
        actions: [raise('LIKE')],
      }
      // Add two possible transitions here:
      // One that raises UNLIKE if the `likeStatus` is 'liked',
      // and one that raises LIKE if it's 'unliked'.
    ],
    VOLUME: {
      // Make sure the volume can only be assigned if the level is
      // within range (between 0 and 10)
      cond: 'volumeChange',
      // cond: (context) => context.volume > 0 && context.volume < 10,
      actions: 'assignVolume',
    },
    'AUDIO.TIME': {
      actions: 'assignTime',
    },
  },
}).withConfig({
  actions: {
    assignSongData: assign({
      title: (_, e) => e.data.title,
      artist: (_, e) => e.data.artist,
      duration: (ctx, e) => e.data.duration,
      elapsed: 0,
      likeStatus: 'unliked',
    }),
    likeSong: assign({
      likeStatus: 'liked',
    }),
    unlikeSong: assign({
      likeStatus: 'unliked',
    }),
    dislikeSong: assign({
      likeStatus: 'disliked',
    }),
    assignVolume: assign({
      volume: (_, e) => e.level,
    }),
    assignTime: assign({
      elapsed: (_, e) => e.currentTime,
    }),
    skipSong: () => {
      console.log('Skipping song');
    },
    playAudio: () => {
    },
    pauseAudio: () => {
    },
  },
  guards: {
    volumeChange: (context, event) => event.level >= 0 && event.level <= 10
  }
});

export function Player() {
  const [state, send] = useMachine(playerMachine);
  const {context} = state;

  useEffect(() => {
    const i = setTimeout(() => {
      send({
        type: 'LOADED',
        data: {
          title: 'Some song title',
          artist: 'Some song artist',
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
              onChange={(event) => send(
                  {type: 'AUDIO.TIME', currentTime: event.target.value})}

          />
          <output id="elapsed">
            {formatTime(context.elapsed - context.duration)}
          </output>
        </div>
        <div className="controls">
          <button
              id="button-like"
              onClick={() => send({type: 'LIKE.TOGGLE'})}
              data-like-status={context.likeStatus}
          ></button>
          <button
              id="button-dislike"
              onClick={() => send({type: 'DISLIKE'})}
          ></button>
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
          <button
              id="button-skip"
              onClick={() => send({type: 'SKIP'})}
          ></button>
          <button
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
          <div style={{display: 'flex'}}>
            <button style={{fontSize: 38}}
                    onClick={() => send(
                        {type: 'VOLUME', level: context.volume + 1})}
            >+
            </button>
            <button style={{fontSize: 38}}
                    onClick={() => send(
                        {type: 'VOLUME', level: context.volume - 1})}
            >-
            </button>
            <span>{context.volume}</span>
          </div>
        </div>
      </div>
  );
}
