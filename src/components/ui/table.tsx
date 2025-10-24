import { Table } from './Table';

export default function Example() {
  return (
    <Table
      headers={['Name', 'Role', 'Email']}
      data={[
        ['Aarav Mehta', 'Engineer', 'aarav@sagurai.com'],
        ['Sia Patel', 'Designer', 'sia@sagurai.com'],
        ['Karan Rao', 'Manager', 'karan@sagurai.com'],
      ]}
      footer={['', '', 'Total: 3']}
      caption="Team Directory"
    />
  );
}
