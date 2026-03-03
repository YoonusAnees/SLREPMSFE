import Card from "../../components/Card";

export default function OfficerHome() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Traffic Officer Portal</h1>
      <Card title="Quick Tasks">
        <ul className="list-disc pl-5 text-sm text-gray-700">
          <li>
            Issue penalty by <b>licenseNo</b> (+ optional plateNo)
          </li>
          <li>Verify vehicle ownership</li>
          <li>Manage violation types (seed/list)</li>
        </ul>
      </Card>
    </div>
  );
}
