const { useState, useEffect } = React;

function Nav({ view, setView }) {
  return React.createElement('div', { className: 'space-x-2 mb-4' }, [
    React.createElement(
      'button',
      {
        className: `px-2 py-1 rounded ${view === 'teams' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`,
        onClick: () => setView('teams')
      },
      'Teams'
    ),
    React.createElement(
      'button',
      {
        className: `px-2 py-1 rounded ${view === 'people' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`,
        onClick: () => setView('people')
      },
      'People'
    ),
    React.createElement(
      'button',
      {
        className: `px-2 py-1 rounded ${view === 'summary' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`,
        onClick: () => setView('summary')
      },
      'Summary'
    )
  ]);
}

function SummaryBar({ people, globalFee }) {
  return React.createElement(
    'div',
    { className: 'p-4 bg-gray-100 rounded mt-4' },
    `Total People: ${people.length} | Global Fee: ${globalFee}%`
  );
}

function DataControls({ teams, people, setTeams, setPeople }) {
  const fileRef = React.useRef(null);

  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify({ teams, people }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-fee-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        const t = Array.isArray(data.teams) ? data.teams : [];
        const p = Array.isArray(data.people) ? data.people : [];
        setTeams(t);
        setPeople(p);
        localStorage.setItem('teams', JSON.stringify(t));
        localStorage.setItem('people', JSON.stringify(p));
      } catch (err) {
        console.error('Invalid JSON file', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const importData = () => {
    if (fileRef.current) fileRef.current.click();
  };

  return React.createElement('div', { className: 'space-x-2 mb-4' }, [
    React.createElement(
      'button',
      {
        className: 'px-2 py-1 bg-green-500 text-white rounded',
        onClick: exportData
      },
      'Export JSON'
    ),
    React.createElement(
      'button',
      {
        className: 'px-2 py-1 bg-green-500 text-white rounded',
        onClick: importData
      },
      'Import JSON'
    ),
    React.createElement('input', {
      type: 'file',
      accept: 'application/json',
      ref: fileRef,
      style: { display: 'none' },
      onChange: onFileChange
    })
  ]);
}

function TeamsPanel({ teams, setTeams, people, setPeople }) {
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);

  const submit = () => {
    if (!name.trim()) return;
    if (editId) {
      setTeams(teams.map(t => t.id === editId ? { ...t, name } : t));
    } else {
      setTeams([...teams, { id: Date.now().toString(), name }]);
    }
    setName('');
    setEditId(null);
  };

  const edit = t => {
    setName(t.name);
    setEditId(t.id);
  };

  const remove = id => {
    setTeams(teams.filter(t => t.id !== id));
    setPeople(people.filter(p => p.teamId !== id));
  };

  const cancel = () => {
    setName('');
    setEditId(null);
  };

  return React.createElement('div', { className: 'mt-4' }, [
    React.createElement('h2', { className: 'text-xl mb-2' }, 'Teams'),
    React.createElement('div', { className: 'mb-2' }, [
      React.createElement('input', {
        className: 'border p-1 mr-2',
        placeholder: 'Team Name',
        value: name,
        onChange: e => setName(e.target.value)
      }),
      React.createElement(
        'button',
        { className: 'bg-blue-500 text-white px-2 py-1 mr-2 rounded', onClick: submit },
        editId ? 'Save' : 'Add'
      ),
      editId
        ? React.createElement(
            'button',
            { className: 'bg-gray-300 px-2 py-1 rounded', onClick: cancel },
            'Cancel'
          )
        : null
    ]),
    React.createElement(
      'ul',
      null,
      teams.map(t =>
        React.createElement('li', { key: t.id, className: 'mb-1' }, [
          React.createElement(
            'span',
            { className: 'mr-2' },
            `${t.name}`
          ),
          React.createElement(
            'button',
            { className: 'bg-yellow-500 text-white px-2 py-1 mr-1 rounded', onClick: () => edit(t) },
            'Edit'
          ),
          React.createElement(
            'button',
            { className: 'bg-red-500 text-white px-2 py-1 rounded', onClick: () => remove(t.id) },
            'Delete'
          )
        ])
      )
    )
  ]);
}

function PeoplePanel({ teams, people, setPeople, selectedTeamId, setSelectedTeamId }) {
  const [name, setName] = useState('');
  const [fee, setFee] = useState('');
  const [editId, setEditId] = useState(null);

  const submit = () => {
    if (!name.trim() || !selectedTeamId) return;
    if (editId) {
      setPeople(people.map(p => p.id === editId ? { ...p, name, fee: fee ? parseFloat(fee) : undefined } : p));
    } else {
      setPeople([...people, { id: Date.now().toString(), teamId: selectedTeamId, name, fee: fee ? parseFloat(fee) : undefined }]);
    }
    setName('');
    setFee('');
    setEditId(null);
  };

  const edit = p => {
    setName(p.name);
    setFee(p.fee !== undefined ? p.fee : '');
    setEditId(p.id);
  };

  const remove = id => {
    setPeople(people.filter(p => p.id !== id));
  };

  const cancel = () => {
    setName('');
    setFee('');
    setEditId(null);
  };

  const teamOptions = teams.map(t =>
    React.createElement('option', { value: t.id, key: t.id }, t.name)
  );

  const peopleForTeam = people.filter(p => p.teamId === selectedTeamId);

  return React.createElement('div', { className: 'mt-4' }, [
    React.createElement('h2', { className: 'text-xl mb-2' }, 'People'),
    React.createElement('div', { className: 'mb-2' }, [
      React.createElement(
        'select',
        {
          className: 'border p-1 mr-2',
          value: selectedTeamId,
          onChange: e => setSelectedTeamId(e.target.value)
        },
        [React.createElement('option', { value: '', key: '' }, 'Select Team')].concat(teamOptions)
      )
    ]),
    selectedTeamId
      ? React.createElement('div', { className: 'mb-2' }, [
          React.createElement('input', {
            className: 'border p-1 mr-2',
            placeholder: 'Person Name',
            value: name,
            onChange: e => setName(e.target.value)
          }),
          React.createElement('input', {
            className: 'border p-1 mr-2 w-24',
            placeholder: 'Fee %',
            type: 'number',
            value: fee,
            onChange: e => setFee(e.target.value)
          }),
          React.createElement(
            'button',
            { className: 'bg-blue-500 text-white px-2 py-1 mr-2 rounded', onClick: submit },
            editId ? 'Save' : 'Add'
          ),
          editId
            ? React.createElement(
                'button',
                { className: 'bg-gray-300 px-2 py-1 rounded', onClick: cancel },
                'Cancel'
              )
            : null
        ])
      : null,
    selectedTeamId
      ? React.createElement(
          'ul',
          null,
          peopleForTeam.map(p =>
            React.createElement('li', { key: p.id, className: 'mb-1' }, [
              React.createElement(
                'span',
                { className: 'mr-2' },
                `${p.name} ${p.fee !== undefined ? '(' + p.fee + '%)' : ''}`
              ),
              React.createElement(
                'button',
                { className: 'bg-yellow-500 text-white px-2 py-1 mr-1 rounded', onClick: () => edit(p) },
                'Edit'
              ),
              React.createElement(
                'button',
                { className: 'bg-red-500 text-white px-2 py-1 rounded', onClick: () => remove(p.id) },
                'Delete'
              )
            ])
          )
        )
      : null
  ]);
}

function SummaryPanel({ teams, people, globalFee }) {
  const teamSections = teams.map(t => {
    const members = people.filter(p => p.teamId === t.id);
    return React.createElement('div', { key: t.id, className: 'mb-2' }, [
      React.createElement('h3', { className: 'font-semibold' }, t.name),
      React.createElement(
        'ul',
        null,
        members.map(m =>
          React.createElement(
            'li',
            { key: m.id },
            `${m.name}${m.fee !== undefined ? ' (' + m.fee + '%)' : ''}`
          )
        )
      )
    ]);
  });

  return React.createElement('div', { className: 'mt-4' }, [
    React.createElement('h2', { className: 'text-xl mb-2' }, 'Summary'),
    React.createElement('div', { className: 'mb-4' }, [
      React.createElement('label', { className: 'mr-2' }, 'Global Fee %:'),
      React.createElement('span', { className: 'font-semibold' }, `${globalFee}%`)
    ]),
    teamSections.length
      ? React.createElement('div', null, teamSections)
      : React.createElement('p', null, 'No teams added')
  ]);
}

function App() {
  const [teams, setTeams] = useState([]);
  const [people, setPeople] = useState([]);
  const [view, setView] = useState('teams');
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const globalFee = people.reduce(
    (sum, p) => sum + (typeof p.fee === 'number' ? p.fee : 0),
    0
  );

  useEffect(() => {
    const t = JSON.parse(localStorage.getItem('teams') || '[]');
    const p = JSON.parse(localStorage.getItem('people') || '[]');
    setTeams(t);
    setPeople(p);
  }, []);

  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('people', JSON.stringify(people));
  }, [people]);

  return React.createElement('div', { className: 'max-w-2xl mx-auto bg-white p-4 rounded shadow' }, [
    React.createElement(Nav, { view, setView }),
    React.createElement(DataControls, { teams, people, setTeams, setPeople }),
    React.createElement(SummaryBar, { people, globalFee }),
    view === 'teams'
      ? React.createElement(TeamsPanel, { teams, setTeams, people, setPeople })
      : null,
    view === 'people'
      ? React.createElement(PeoplePanel, {
          teams,
          people,
          setPeople,
          selectedTeamId,
          setSelectedTeamId
        })
      : null,
    view === 'summary'
      ? React.createElement(SummaryPanel, { teams, people, globalFee })
      : null
  ]);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(App)
);
