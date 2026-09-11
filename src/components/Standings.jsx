import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const CURRENT_SEASON = 2026;
const CURRENT_WEEK = 2;

function Standings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadStandings() {
      setLoading(true);
      setErrorMessage("");

      const { data: picks, error: picksError } = await supabase
        .from("picks")
        .select("user_id, week, points_awarded")
        .eq("season", CURRENT_SEASON);

      if (picksError) {
        console.error("Error loading picks:", picksError);
        setErrorMessage(picksError.message);
        setLoading(false);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, picking_team_name");

      if (profilesError) {
        console.error("Error loading profiles:", profilesError);
        setErrorMessage(profilesError.message);
        setLoading(false);
        return;
      }

      const seasonTotals = {};
      const weekTotals = {};

      (picks ?? []).forEach((pick) => {
        const points = pick.points_awarded ?? 0;

        if (!seasonTotals[pick.user_id]) {
          seasonTotals[pick.user_id] = 0;
        }

        seasonTotals[pick.user_id] += points;

        if (pick.week === CURRENT_WEEK) {
          if (!weekTotals[pick.user_id]) {
            weekTotals[pick.user_id] = 0;
          }

          weekTotals[pick.user_id] += points;
        }
      });

      const leaderboard = (profiles ?? [])
        .map((profile) => ({
          userId: profile.id,
          teamName: profile.picking_team_name,
          weekPoints: weekTotals[profile.id] ?? 0,
          totalPoints: seasonTotals[profile.id] ?? 0,
        }))
        .sort((a, b) => {
          if (b.totalPoints !== a.totalPoints) {
            return b.totalPoints - a.totalPoints;
          }

          return b.weekPoints - a.weekPoints;
        });

      setStandings(leaderboard);
      setLoading(false);
    }

    loadStandings();
  }, []);

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        maxWidth: "500px",
        margin: "30px auto",
        boxShadow: "0 4px 10px rgba(0,0,0,.15)",
      }}
    >
      <h2>Season Standings</h2>

      {loading && <p>Loading standings...</p>}

      {errorMessage && (
        <p style={{ color: "red" }}>
          Error loading standings: {errorMessage}
        </p>
      )}

      {!loading &&
        !errorMessage &&
        standings.map((player, index) => (
          <p key={player.userId}>
            {index === 0
              ? "🥇"
              : index === 1
              ? "🥈"
              : index === 2
              ? "🥉"
              : `${index + 1}.`}
            {" "}
            {player.teamName}
            {" — "}
            Week {CURRENT_WEEK}: {player.weekPoints} pts
            {" | "}
            Total: {player.totalPoints} pts
          </p>
        ))}
    </div>
  );
}

export default Standings;