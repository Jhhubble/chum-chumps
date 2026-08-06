import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PickButton from "./PickButton.jsx";

const games = [{ 
  home: "Michigan",
  away: "Ohio State"
  }, 
  { 
  home: "LSU",
  away: "Alabama"
  },
  {
  home: "Georgia",
  away: "Florida"
  },
  {
  home: "Georgia",
  away: "Florida"
  },
  {
  home: "Georgia",
  away: "Florida"
  }
];


function GameCard() {
  const firstGame = games[0];
  const secondGame = games[1];
  const thirdGame = games[2];
  const fourthGame = games[3];
  const fifthGame = games[4];
  const [selectedTeam1, setSelectedTeam1] = useState("");
  const [selectedTeam2, setSelectedTeam2] = useState("");
  const [selectedTeam3, setSelectedTeam3] = useState("");
  const [selectedTeam4, setSelectedTeam4] = useState("");
  const [selectedTeam5, setSelectedTeam5] = useState("");
  function chooseTeam1(team) {
    setSelectedTeam1(team);
  }
  function chooseTeam2(team) {
    setSelectedTeam2(team);
  }
  function chooseTeam3(team) {
    setSelectedTeam3(team);
  }
  function chooseTeam4(team) {
    setSelectedTeam4(team);
  }
  function chooseTeam5(team) {
    setSelectedTeam5(team);
  }
  const [upsetOptions, setUpsetOptions] = useState([]);
  const [selectedSportsbook, setSelectedSportsbook] = useState("");
  const [upsetPick, setUpsetPick] = useState(null);
  const [isLoadingUpsets, setIsLoadingUpsets] = useState(true);
  const [upsetError, setUpsetError] = useState("");

  useEffect(() => {
    async function loadUpsetOptions() {
      setIsLoadingUpsets(true);
      setUpsetError("");

      const { data, error } = await supabase.functions.invoke(
        "get-upset-options",
      {
        body: {
          season: 2026,
          week: 1,
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
    setUpsetOptions(data  ?? []);

    if (data?.length > 0) {
      setSelectedSportsbook(data[0].sportsbookKey);
    }

    setIsLoadingUpsets(false);
  }

  loadUpsetOptions();
  }, []);

  const sportbooks = [
    ...new Map(
      upsetOptions.map((option) => [
        option.sportsbookKey,
        {
          key: option.sportsbookKey,
          name: option.sportsbookName,
        },
      ])
    ).values(),
  ];

  const visibleUpsetOptions = upsetOptions.filter(
    (option) => option.sportsbookKey === selectedSportsbook
  );


  function submitPick() {
    alert(`You picked 
      ${selectedTeam1} 
      ${selectedTeam2}
      ${selectedTeam3}
      ${selectedTeam4}
      ${selectedTeam5}
      Upset Pick: ${upsetPick.underdog} +${upsetPick.spread}
      vs ${upsetPick.favorite}
      using ${upsetPick.sportsbookName}
      `);
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
      <h2>Game 1</h2> 
      <PickButton team={games[0].home} selected={selectedTeam1} onclick={() => chooseTeam1(games[0].home)} />  VS    <PickButton team={games[0].away} selected={selectedTeam1} onclick={() => chooseTeam1(games[0].away)} />

      <h2>Game 2</h2>  
      <PickButton team={games[1].home} selected={selectedTeam2} onclick={() => chooseTeam2(games[1].home)} />  VS    <PickButton team={games[1].away} selected={selectedTeam2} onclick={() => chooseTeam2(games[1].away)} />

      
      <h2>Game 3</h2>
      <PickButton team={games[2].home} selected={selectedTeam3} onclick={() => chooseTeam3(games[2].home)} />  VS    <PickButton team={games[2].away} selected={selectedTeam3} onclick={() => chooseTeam3(games[2].away)} />
      
      <h2>Game 4</h2>
      <PickButton team={games[3].home} selected={selectedTeam4} onclick={() => chooseTeam4(games[3].home)} />  VS    <PickButton team={games[3].away} selected={selectedTeam4} onclick={() => chooseTeam4(games[3].away)} />

      <h2>Game 5</h2>
      <PickButton team={games[4].home} selected={selectedTeam5} onclick={() => chooseTeam5(games[4].home)} />  VS    <PickButton team={games[4].away} selected={selectedTeam5} onclick={() => chooseTeam5(games[4].away)} />
      
      
      <h2>Upset Pick</h2>

      <p>Choose an underdog of +6.5 or greater</p>

      {isLoadingUpsets && <p>Loading upset options...</p>}

      {upsetError && (
        <p style={{ color: "red" }}>
          Error loading upset options: {upsetError}
        </p>
      )}

      {!isLoadingUpsets && !upsetError && sportbooks.length === 0 && (
        <p>No upset options available.</p>
      )}

      {sportbooks.length > 0 && (
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
            {sportbooks.map((book) => (
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
          onClick={() => setUpsetPick(option)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px",
            borderRadius: "8px",
            border: "2px solid black",
            cursor: "pointer",
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
        disabled={!selectedTeam1 || !selectedTeam2 || !selectedTeam3 || !selectedTeam4 || !selectedTeam5 || !upsetPick}
        style={{
          width: "100%",
          marginTop: "25px",
          padding: "18px",
          fontSize: "18px",
          backgroundColor: "#0B5ED7",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: selectedTeam1 && selectedTeam2 && selectedTeam3 && selectedTeam4 && selectedTeam5 && upsetPick ? "pointer" : "not-allowed",
          opacity: selectedTeam1 && selectedTeam2 && selectedTeam3 && selectedTeam4 && selectedTeam5 && upsetPick ? 1 : 0.5
        }}
      >
        Submit Pick
      </button>
    </div>
  );
}

export default GameCard;