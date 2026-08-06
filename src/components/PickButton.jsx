function PickButton({ team, selected, onclick }) {
  const isSelected = selected === team;
  return (
    <button 
      onClick={onclick}
      style={{
        backgroundColor: isSelected ? "#0f0f0f" : "#690fd8",
        color: "white",
        border: "none",
        padding: "10px",
        margin: "5px",
        borderRadius: "8px",
        cursor: "pointer"
      }}
    >
      {team}
    </button>
  );
}

export default PickButton;