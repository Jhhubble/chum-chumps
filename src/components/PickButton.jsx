function PickButton({ team, selected, onclick, disabled = false }) {
  const isSelected = selected === team;

  return (
    <button
      onClick={onclick}
      disabled={disabled}
      style={{
        backgroundColor: isSelected ? "#0f0f0f" : "#690fd8",
        color: "white",
        border: "none",
        padding: "10px",
        margin: "5px",
        borderRadius: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {team}
    </button>
  );
}

export default PickButton;