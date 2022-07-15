import { BattleInfo } from "../pages/battle";

type BattleSummaryProps = {
  battleInfo: BattleInfo;
};

const BattleSummary = ({ battleInfo }: BattleSummaryProps) => {
  const { battleEvents, battleOutcome } = battleInfo;
  return (
    <div className="p-4 m-4 border">
      <table>
        <thead>
          <tr>
            <th>Attacker</th>
            <th>Damage</th>
          </tr>
        </thead>
        <tbody>
          {battleEvents.map((event) => (
            <tr>
              <td className="px-2 text-center">
                {event.args.damageByHash.toHexString()}
              </td>
              <td className="px-2 text-center">
                {event.args.damage.toString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="font-bold">Winner: </div>
      {battleOutcome.args.winnerHash.toHexString()}
      <br />
      <div className="font-bold">Loser: </div>
      {battleOutcome.args.loserHash.toHexString()}
    </div>
  );
};

export default BattleSummary;
