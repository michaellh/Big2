import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import UserModel, { IUser } from '../models/user';
import LobbyModel from '../models/lobby';
import GameStateModel, { IGameState } from '../models/gameState';

const scheduler = new ToadScheduler();

const task = new AsyncTask(
  'Delete stale User and Lobby documents',
  async () => {
    const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);

    const lobbies = await LobbyModel.find({}).populate<{
      host: IUser;
      players: IUser[];
      gameState: IGameState;
    }>(['host', 'players', 'gameState']);

    await Promise.all(
      lobbies.map(async (lobby) => {
        const { host, players, gameState } = lobby;

        if (host.last_active <= sixtyMinutesAgo) {
          await Promise.all(
            players.map(async (player) => {
              await UserModel.findByIdAndDelete(player._id);
            }),
          );

          await GameStateModel.findByIdAndDelete(gameState._id);
          await LobbyModel.findByIdAndDelete(lobby._id);
        }
      }),
    );
  },
  (err: Error) => {
    console.log('Failed to delete in cleanup-scheduler', err);
  },
);

export const cleanUpJob = new SimpleIntervalJob({ seconds: 30 }, task);

export default scheduler;
