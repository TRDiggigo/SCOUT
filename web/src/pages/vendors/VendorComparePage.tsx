import { FormEvent, useState } from 'react';

import { PageHeader } from '../../components/PageHeader';
import { compareVendors } from './api';
import type { VendorCompareItemDto } from './types';

export function VendorComparePage(): JSX.Element {
  const [vendorInput, setVendorInput] = useState('');
  const [items, setItems] = useState<VendorCompareItemDto[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const vendorIds = vendorInput
      .split(',')
      .map((vendorId) => vendorId.trim())
      .filter(Boolean);

    if (vendorIds.length < 2 || vendorIds.length > 5) {
      setErrorMessage('Please select between 2 and 5 vendors.');
      setItems([]);
      return;
    }

    setErrorMessage('');

    try {
      const response = await compareVendors(vendorIds);
      setItems(response.items);

      if (response.items.length === 0) {
        setErrorMessage('No matching vendors found for comparison.');
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'validation_error') {
        setErrorMessage('Invalid vendor selection. Use unique vendor IDs and choose 2 to 5 vendors.');
      } else {
        setErrorMessage('Vendor comparison could not be loaded.');
      }
      setItems([]);
    }
  }

  return (
    <main>
      <PageHeader title='Vendor Compare' subtitle='Compare 2 to 5 vendors side-by-side.' />

      <form onSubmit={handleSubmit}>
        <label htmlFor='vendor-compare-input'>Vendor IDs (comma separated)</label>
        <input
          id='vendor-compare-input'
          aria-label='Vendor compare input'
          value={vendorInput}
          onChange={(event) => setVendorInput(event.target.value)}
          placeholder='vendor-001,vendor-002'
        />
        <button type='submit'>Compare</button>
      </form>

      {errorMessage && <p>{errorMessage}</p>}

      {items.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Vendor ID</th>
              <th>Vendor</th>
              <th>Category</th>
              <th>Overall score</th>
              <th>Confidence</th>
              <th>Freshness</th>
              <th>As of date</th>
              <th>Source run</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.vendorId}>
                <td>{item.vendorId}</td>
                <td>{item.vendorName}</td>
                <td>{item.category}</td>
                <td>{item.overallScore}</td>
                <td>{item.confidence}</td>
                <td>{item.freshnessStatus}</td>
                <td>{item.asOfDate}</td>
                <td>{item.sourceRunId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
