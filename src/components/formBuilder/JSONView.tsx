interface JSONViewProps {
  jsonData: string;
}

export default function JSONView({ jsonData }: JSONViewProps) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Generated JSON:</h3>
      </div>
      <pre
        style={{
          backgroundColor: '#282c34',
          color: '#abb2bf',
          padding: '1rem',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '0.85rem',
          lineHeight: '1.4',
          margin: 0,
          flex: 1,
          whiteSpace: 'pre-wrap',
        }}
      >
        {jsonData}
      </pre>
    </div>
  );
}
