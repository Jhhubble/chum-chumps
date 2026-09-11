import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PickButton from "./PickButton.jsx";

const CURRENT_SEASON = 2026;
const CURRENT_WEEK = 2;


function GameCard() {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gamesError, setGamesError] = useState("");
  
  const [featuredPicks, setFeaturedPicks] = useState({});
  function chooseFeaturedTeam(gameId, team) {
  setFeaturedPicks((currentPicks) => ({
    ...currentPicks,
    [gameId]: team,
  }));
  }

  const [upsetOptions, setUpsetOptions] = useState([]);
  const [selectedSportsbook, setSelectedSportsbook] = useState("");
  const [upsetPick, setUpsetPick] = useState(null);
  const [isLoadingUpsets, setIsLoadingUpsets] = useState(true);
  const [upsetError, setUpsetError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const [savedPicks, setSavedPicks] = useState([]);
  const [savedPicksLoading, setSavedPicksLoading] = useState(true);
  const [savedPicksError, setSavedPicksError] = useState("");

  const [claimedUpsetGameIds, setClaimedUpsetGameIds] = useState([]);

  const [ownUpsetGameId, setOwnUpsetGameId] = useState(null);

  function hasGameStarted(kickoff) {
    if (!kickoff) return false;

    return new Date() >= new Date(kickoff);
  }

  async function loadClaimedUpsetGames() {
    const { data, error } = await supabase.rpc(
      "get_claimed_upset_games",
      {
        p_season: CURRENT_SEASON,
        p_week: CURRENT_WEEK,
      }
    );

    if (error) {
      console.error("Error loading claimed upset games:", error);
      return;
    }

    const claimedIds = (data ?? []).map(
      (row) => row.external_game_id
    );

    setClaimedUpsetGameIds(claimedIds);
  }



  useEffect(() => {
  async function loadFeaturedGames() {
    setGamesLoading(true);
    setGamesError("");

    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("season", CURRENT_SEASON)
      .eq("week", CURRENT_WEEK)
      .eq("is_featured", true)
      .order("kickoff", { ascending: true });

    if (error) {
      console.error(error);
      setGamesError(error.message);
      setGamesLoading(false);
      return;
    }

    console.log("Featured games received:", data);

    setFeaturedGames(data ?? []);
    setGamesLoading(false);
  }

  loadFeaturedGames();
  }, []);

 useEffect(() => {
    async function loadUpsetOptions() {
      setIsLoadingUpsets(true);
      setUpsetError("");

      const { data, error } = await supabase.functions.invoke(
        "get-upset-options",
        {
          body: {
            season: CURRENT_SEASON,
            week: CURRENT_WEEK,
          },
        }
      );

      if (error) {
        setUpsetError(error.message);
        setIsLoadingUpsets(false);
        return;
      }

      console.log("Upset options received:", data);
      console.log("First upset option:", data?.[0]);

      setUpsetOptions(data ?? []);

      if (data?.length > 0) {
        setSelectedSportsbook(data[0].sportsbookKey);
      }

      setIsLoadingUpsets(false);
    }

    loadUpsetOptions();
  }, []);


  async function loadSavedPicks() {
    setSavedPicksLoading(true);
    setSavedPicksError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSavedPicksError(
        "You must be logged in to view saved picks."
      );
      setSavedPicksLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("picks")
      .select(`
        id,
        game_id,
        selected_team,
        is_upset_pick,
        spread_at_pick,
        sportsbook,
        points_awarded,
        games (
          external_game_id,
          home_team,
          away_team,
          kickoff
        )
      `)
      .eq("user_id", user.id)
      .eq("season", CURRENT_SEASON)
      .eq("week", CURRENT_WEEK)
      .order("is_upset_pick", { ascending: true });

    if (error) {
      console.error("Error loading saved picks:", error);
      setSavedPicksError(error.message);
      setSavedPicksLoading(false);
      return;
    }

    const loadedPicks = data ?? [];

      setSavedPicks(loadedPicks);

      // Restore the 5 featured picks
      const restoredFeaturedPicks = {};

      loadedPicks
        .filter((pick) => !pick.is_upset_pick)
        .forEach((pick) => {
          restoredFeaturedPicks[pick.game_id] = pick.selected_team;
        });

      setFeaturedPicks(restoredFeaturedPicks);

      // Remember which upset game belongs to this user
      const savedUpset = loadedPicks.find(
        (pick) => pick.is_upset_pick
      );

      if (savedUpset?.games?.external_game_id) {
        setOwnUpsetGameId(savedUpset.games.external_game_id);
      }

      setSavedPicksLoading(false);
  }

  useEffect(() => {
    loadSavedPicks();
  }, []);  

  useEffect(() => {
    loadClaimedUpsetGames();
  }, []);

  const sportsbooks = [
    ...new Map(
      upsetOptions.map((option) => [
        option.sportsbookKey,
        {
          key: option.sportsbookKey,
          name: option.sportsbookName,
        },
      ])
    ).values(),];

  useEffect(() => {
    if (savedPicks.length === 0 || upsetOptions.length === 0) {
      return;
    }

    const savedUpset = savedPicks.find(
      (pick) => pick.is_upset_pick
    );

    if (!savedUpset?.games?.external_game_id) {
      return;
    }

    const matchingOption = upsetOptions.find(
      (option) =>
        option.id === savedUpset.games.external_game_id &&
        option.sportsbookName === savedUpset.sportsbook
    );

    if (matchingOption) {
      setSelectedSportsbook(matchingOption.sportsbookKey);
      setUpsetPick(matchingOption);
    }
  }, [savedPicks, upsetOptions]);


  const visibleUpsetOptions = upsetOptions.filter(
    (option) => 
      option.sportsbookKey === selectedSportsbook &&
      (
      !claimedUpsetGameIds.includes(option.id) ||
      option.id === ownUpsetGameId
      )
  );

  const allFeaturedGamesPicked =
    featuredGames.length === 5 &&
    featuredGames.every((game) => Boolean(featuredPicks[game.id]));


  async function submitPick() {
    setSubmitMessage("");

    if (!allFeaturedGamesPicked) {
      setSubmitMessage("Please pick a team for all 5 games.");
      return;
    }

    if (!upsetPick) {
      setSubmitMessage("Please choose an upset pick.");
      return;
    }

    setIsSubmitting(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSubmitMessage("You must be logged in to submit picks.");
      setIsSubmitting(false);
      return;
    }

    const featuredPickRows = featuredGames.map((game) => ({
      user_id: user.id,
      game_id: game.id,
      season: CURRENT_SEASON,
      week: CURRENT_WEEK ,
      selected_team: featuredPicks[game.id],
      is_upset_pick: false,
      spread_at_pick: null,
      sportsbook: null,
    }));

    console.log("Rows being saved:", featuredPickRows);

    const { error } = await supabase
      .from("picks")
      .upsert(featuredPickRows, {
        onConflict: "user_id,game_id",
      });

    if (error) {
      console.error("Error saving picks:", error);
      setSubmitMessage(`Error saving picks: ${error.message}`);
      setIsSubmitting(false);
      return;
    }


    // Save the upset pick
    const { error: upsetSaveError } = await supabase.rpc(
    "claim_upset_pick",
    {
      p_external_game_id: upsetPick.id,
      p_season: CURRENT_SEASON,
      p_week: CURRENT_WEEK ,
      p_home_team: upsetPick.homeTeam,
      p_away_team: upsetPick.awayTeam,
      p_kickoff: upsetPick.kickoff,
      p_underdog: upsetPick.underdog,
      p_spread: upsetPick.spread,
      p_sportsbook: upsetPick.sportsbookName,
    }
    );

    if (upsetSaveError) {
      console.error("Error saving upset:", upsetSaveError);

      if (upsetSaveError.message.includes("already been selected")) {
        setSubmitMessage(
          "That upset was just picked by another player. Please choose another upset."
        );
      } else {
        setSubmitMessage(
          `Error saving upset: ${upsetSaveError.message}`
        );
      }

      setIsSubmitting(false);
      return;
    }

    setSubmitMessage("All 6 picks submitted successfully!");

    await loadSavedPicks();
    await loadClaimedUpsetGames();
    
    setIsSubmitting(false);
  }



  return (
    <div
      style={{
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,.15)",
        maxWidth: "500px",
        margin: "30px auto",
        textAlign: "center"
      }}
    >
      {gamesLoading && <p>Loading this week's games...</p>}

      {gamesError && (
      <p style={{ color: "red" }}>
      Error loading games: {gamesError}
      </p>
      )}

      {featuredGames.map((game, index) => (
      <div key={game.id}>
      <h2>Game {index + 1}</h2>

      <PickButton
        team={game.home_team}
        selected={featuredPicks[game.id]}
        disabled={hasGameStarted(game.kickoff)}
        onclick={() => {
          if (!hasGameStarted(game.kickoff)) {
            chooseFeaturedTeam(game.id, game.home_team)
        }
      }}
      />

      {" VS "}

      <PickButton
        team={game.away_team}
        selected={featuredPicks[game.id]}
        disabled={hasGameStarted(game.kickoff)}
        onclick={() => {
          if (!hasGameStarted(game.kickoff)) {
          chooseFeaturedTeam(game.id, game.away_team)
        }
      }}
      />

      {hasGameStarted(game.kickoff) && (
        <p
          style={{
            fontSize: "13px",
            color: "#666",
          }}
        >
          🔒 Pick locked — game has started
        </p>
      )}
    </div>
  ))}      
  

      
      
      <h2>Upset Pick</h2>

      <p>Choose an underdog of +6.5 or greater</p>

      {isLoadingUpsets && <p>Loading upset options...</p>}

      {upsetError && (
        <p style={{ color: "red" }}>
          Error loading upset options: {upsetError}
        </p>
      )}

      {!isLoadingUpsets && !upsetError && sportsbooks.length === 0 && (
        <p>No upset options available.</p>
      )}

      {sportsbooks.length > 0 && (
        <label
          style={{
            display: "grid",
            gap: "6px",
            marginBottom: "15px",
            textAlign: "left"
          }}
        >
          Sportsbook
          <select
            value={selectedSportsbook}
            onChange={(event) => {
              setSelectedSportsbook(event.target.value);
              setUpsetPick(null);
            }}
            style={{
              padding: "10px",
              borderRadius: "16px",
            }}
          >
            {sportsbooks.map((book) => (
              <option key={book.key} value={book.key}>
                {book.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {visibleUpsetOptions.map((option) => (
        <button
          key={`${option.id}-${option.sportsbookKey}`}
          onClick={() => {
            if (!hasGameStarted(option.kickoff)) {
              setUpsetPick(option);
            }
          }}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px",
            borderRadius: "8px",
            border: "2px solid black",
            cursor: hasGameStarted(option.kickoff)
              ? "not-allowed"
              : "pointer",
            backgroundColor:
              upsetPick?.id === option.id &&
              upsetPick?.sportsbookKey === option.sportsbookKey
                ? "#0B5ED7"
                : "white",
            color:
              upsetPick?.id === option.id &&
              upsetPick?.sportsbookKey === option.sportsbookKey
                ? "white" 
                : "black"
          }}
        >
          {option.underdog} +{option.spread} vs {option.favorite}
        </button>
      ))}
      <button
        onClick={submitPick}
        disabled={
          !allFeaturedGamesPicked ||
          !upsetPick ||
          isSubmitting
        }
        style={{
          width: "100%",
          marginTop: "25px",
          padding: "18px",
          fontSize: "18px",
          backgroundColor: "#0B5ED7",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor:
            allFeaturedGamesPicked && upsetPick
              ? "pointer"
              : "not-allowed",
          opacity:
            allFeaturedGamesPicked && upsetPick
              ? 1
              : 0.5
        }}
      >
        {isSubmitting ? "Submitting..." : "Submit Pick"}
      </button>

      {submitMessage && (
        <p
          style={{
            marginTop: "15px",
            fontWeight: "bold",
          }}
        >
          {submitMessage}
        </p>
      )}

      <div
        style={{
          marginTop: "30px",
          paddingTop: "20px",
          borderTop: "1px solid #ddd",
          textAlign: "left",
        }}
      >
        <h2>My Week {CURRENT_WEEK} Picks</h2>

        {savedPicksLoading && <p>Loading saved picks...</p>}

        {savedPicksError && (
          <p style={{ color: "red" }}>
            Error loading saved picks: {savedPicksError}
          </p>
        )}

        {!savedPicksLoading &&
          !savedPicksError &&
          savedPicks.length === 0 && (
            <p>You have not submitted picks yet.</p>
          )}

        {savedPicks.map((pick) => (
          <div
            key={pick.id}
            style={{
              padding: "10px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            {pick.is_upset_pick ? (
              <>
                <strong>Upset:</strong>{" "}
                {pick.selected_team} +{pick.spread_at_pick}
                {pick.sportsbook && ` (${pick.sportsbook})`}
              </>
            ) : (
              <>
                <strong>{pick.selected_team}</strong>
                {pick.games && (
                  <>
                    {" "}
                    — {pick.games.away_team} vs {pick.games.home_team}
                  </>
                )}
              </>
            )}

            <div style={{ fontSize: "14px", marginTop: "4px" }}>
              Points: {pick.points_awarded}
            </div>
          </div>
        ))}
      </div>



    </div>
  );
}

export default GameCard;