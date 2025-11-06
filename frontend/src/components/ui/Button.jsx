export default function Button({ children, onClick, variant = 'primary' }) {
  const base = 'px-5 py-2 rounded-md font-semibold transition';
  const styles = {
    primary: base + ' relative bg-gradient-to-r from-blue-700 to-blue-500 text-white hover:opacity-95',
    outline: base + ' border border-blue-700 text-blue-700 bg-white hover:bg-blue-50',
  };
  return (
    <button onClick={onClick} className={styles[variant] || styles.primary}>
      {children}
    </button>
  );
}
