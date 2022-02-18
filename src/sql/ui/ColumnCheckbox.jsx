export default function ColumnCheckbox({ checked, onChange }) {
  return (
    <input
      checked={checked}
      style={{ cursor: "pointer" }}
      type="checkbox"
      onChange={onChange}
    />
  );
}
