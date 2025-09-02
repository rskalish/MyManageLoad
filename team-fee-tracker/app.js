const { useState, useEffect } = React;

function Nav({ view, setView }) {
  return React.createElement('div', { className: 'space-x-2' }, [
    React.createElement(
      'button',
      {
        className: `px-2 py-1 ${view === 'teams' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`,
        onClick: () => setView('teams')
      },
      'Teams'
    ),
    React.createElement(
      'button',
      {
        className: `px-2 py-1 ${view === 'people' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`,
        onClick: () => setView('people')
      },
      'People'
    ),
    React.createElement(
      'button',
      {
        className: `px-2 py-1 ${view === 'summary' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`,
        onClick: () => setView('summary')
      },
      'Summary'
    )
  ]);
}

function SummaryBar({ people, teams, globalFee }) {
  const teamFees = {};
  teams.forEach(t => {
    if (t.fee !== undefined) teamFees[t.id] = t.fee;
  });
  let total = 0;
  people.forEach(p => {
    const feePercent = p.fee !== undefined ? p.fee : teamFees[p.teamId] !== undefined ? teamFees[p.teamId] : globalFee;
    const billable = parseFloat(p.billable) || 0;
    total += billable * feePercent / 100;
  });
  return React.createElement(
    'div',
    { className: 'p-2 bg-gray-100 mt-4' },
    `Total People: ${people.length} | Total Management Fee: $${total.toFixed(2)}`
  );
}

function TeamsPanel({ teams, setTeams, people, setPeople }) {
  const [name, setName] = useState('');
  const [fee, setFee] = useState('');
  const [editId, setEditId] = useState(null);

  const submit = () => {
    if (!name.trim()) return;
    if (editId) {
      setTeams(teams.map(t => t.id === editId ? { ...t, name, fee: fee ? parseFloat(fee) : undefined } : t));
    } else {
      setTeams([...teams, { id: Date.now().toString(), name, fee: fee ? parseFloat(fee) : undefined }]);
    }
    setName('');
    setFee('');
    setEditId(null);
  };

  const edit = t => {
    setName(t.name);
    setFee(t.fee !== undefined ? t.fee : '');
    setEditId(t.id);
  };

  const remove = id => {
    setTeams(teams.filter(t => t.id !== id));
    setPeople(people.filter(p => p.teamId !== id));
  };

  const cancel = () => {
    setName('');
    setFee('');
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
      React.createElement('input', {
        className: 'border p-1 mr-2 w-24',
        placeholder: 'Fee %',
        type: 'number',
        value: fee,
        onChange: e => setFee(e.target.value)
      }),
      React.createElement(
        'button',
        { className: 'bg-blue-500 text-white px-2 py-1 mr-2', onClick: submit },
        editId ? 'Save' : 'Add'
      ),
      editId
        ? React.createElement(
            'button',
            { className: 'bg-gray-300 px-2 py-1', onClick: cancel },
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
            `${t.name} ${t.fee !== undefined ? '(' + t.fee + '%)' : ''}`
          ),
          React.createElement(
            'button',
            { className: 'bg-yellow-500 text-white px-2 py-1 mr-1', onClick: () => edit(t) },
            'Edit'
          ),
          React.createElement(
            'button',
            { className: 'bg-red-500 text-white px-2 py-1', onClick: () => remove(t.id) },
            'Delete'
          )
        ])
      )
    )
  ]);
}

function PeoplePanel({ teams, people, setPeople, selectedTeamId, setSelectedTeamId }) {
  const [name, setName] = useState('');
  const [billable, setBillable] = useState('');
  const [fee, setFee] = useState('');
  const [editId, setEditId] = useState(null);

  const submit = () => {
    if (!name.trim() || !selectedTeamId) return;
    if (editId) {
      setPeople(people.map(p => p.id === editId ? { ...p, name, billable, fee: fee ? parseFloat(fee) : undefined } : p));
    } else {
      setPeople([...people, { id: Date.now().toString(), teamId: selectedTeamId, name, billable, fee: fee ? parseFloat(fee) : undefined }]);
    }
    setName('');
    setBillable('');
    setFee('');
    setEditId(null);
  };

  const edit = p => {
    setName(p.name);
    setBillable(p.billable);
    setFee(p.fee !== undefined ? p.fee : '');
    setEditId(p.id);
  };

  const remove = id => {
    setPeople(people.filter(p => p.id !== id));
  };

  const cancel = () => {
    setName('');
    setBillable('');
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
            placeholder: 'Billable',
            type: 'number',
            value: billable,
            onChange: e => setBillable(e.target.value)
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
            { className: 'bg-blue-500 text-white px-2 py-1 mr-2', onClick: submit },
            editId ? 'Save' : 'Add'
          ),
          editId
            ? React.createElement(
                'button',
                { className: 'bg-gray-300 px-2 py-1', onClick: cancel },
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
                `${p.name} ${p.billable ? '$' + p.billable : ''} ${p.fee !== undefined ? '(' + p.fee + '%)' : ''}`
              ),
              React.createElement(
                'button',
                { className: 'bg-yellow-500 text-white px-2 py-1 mr-1', onClick: () => edit(p) },
                'Edit'
              ),
              React.createElement(
                'button',
                { className: 'bg-red-500 text-white px-2 py-1', onClick: () => remove(p.id) },
                'Delete'
              )
            ])
          )
        )
      : null
  ]);
}

function SummaryPanel({ globalFee, setGlobalFee }) {
  const [feeInput, setFeeInput] = useState(globalFee);

  const save = () => {
    const val = parseFloat(feeInput);
    if (!isNaN(val)) setGlobalFee(val);
  };

  return React.createElement('div', { className: 'mt-4' }, [
    React.createElement('h2', { className: 'text-xl mb-2' }, 'Settings'),
    React.createElement('div', null, [
      React.createElement('label', { className: 'mr-2' }, 'Global Fee %:'),
      React.createElement('input', {
        className: 'border p-1 mr-2 w-24',
        type: 'number',
        value: feeInput,
        onChange: e => setFeeInput(e.target.value)
      }),
      React.createElement(
        'button',
        { className: 'bg-blue-500 text-white px-2 py-1', onClick: save },
        'Save'
      )
    ])
  ]);
}

function App() {
  const [teams, setTeams] = useState([]);
  const [people, setPeople] = useState([]);
  const [globalFee, setGlobalFee] = useState(5);
  const [view, setView] = useState('teams');
  const [selectedTeamId, setSelectedTeamId] = useState('');

  useEffect(() => {
    const t = JSON.parse(localStorage.getItem('teams') || '[]');
    const p = JSON.parse(localStorage.getItem('people') || '[]');
    const g = parseFloat(localStorage.getItem('globalFee'));
    setTeams(t);
    setPeople(p);
    if (!isNaN(g)) setGlobalFee(g); else setGlobalFee(5);
  }, []);

  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('people', JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem('globalFee', globalFee);
  }, [globalFee]);

  return React.createElement('div', null, [
    React.createElement(Nav, { view, setView }),
    React.createElement(SummaryBar, { people, teams, globalFee }),
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
      ? React.createElement(SummaryPanel, { globalFee, setGlobalFee })
      : null
  ]);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(App)
);
