import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import UserModel, { IUser } from '../models/user';
import LobbyModel from '../models/lobby';

const scheduler = new ToadScheduler();

const task = new AsyncTask(
  'Delete stale User and Lobby documents',
  async () => {
    const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);

    const lobbies = await LobbyModel.find({}).populate<{
      host: IUser;
      players: IUser[];
    }>(['host', 'players']);

    await Promise.all(
      lobbies.map(async (lobby) => {
        const { host, players } = lobby;

        if (host.last_active <= sixtyMinutesAgo) {
          await Promise.all(
            players.map(async (player) => {
              await UserModel.findByIdAndDelete(player._id);
            }),
          );

          await LobbyModel.findByIdAndDelete(lobby._id);
        }
      }),
    );
  },
  (err: Error) => {
    /* handle error here */
    console.log(err);
  },
);

export const cleanUpJob = new SimpleIntervalJob({ seconds: 30 }, task);

export default scheduler;
