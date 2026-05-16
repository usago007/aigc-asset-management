import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'

interface HierarchySelectorProps {
  value: { customerId?: string; brandId?: string; projectId?: string }
  onChange: (value: { customerId?: string; brandId?: string; projectId?: string }) => void
}

export default function HierarchySelector({ value, onChange }: HierarchySelectorProps) {
  const { customers, brands, projects } = useAppStore()
  
  const [selectedCustomer, setSelectedCustomer] = useState(value.customerId || '')
  const [selectedBrand, setSelectedBrand] = useState(value.brandId || '')

  useEffect(() => {
    setSelectedCustomer(value.customerId || '')
    setSelectedBrand(value.brandId || '')
  }, [value.customerId, value.brandId])

  const filteredBrands = selectedCustomer ? brands.filter(b => b.customerId === selectedCustomer) : brands
  const filteredProjects = selectedBrand ? projects.filter(p => p.brandId === selectedBrand) : projects

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId)
    setSelectedBrand('')
    onChange({ customerId, brandId: '', projectId: '' })
  }

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId)
    onChange({ customerId: selectedCustomer, brandId, projectId: '' })
  }

  const handleProjectChange = (projectId: string) => {
    onChange({ customerId: selectedCustomer, brandId: selectedBrand, projectId })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="label-field">客户</label>
        <select
          value={selectedCustomer}
          onChange={(e) => handleCustomerChange(e.target.value)}
          className="input-field"
        >
          <option value="">选择客户</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.customerName}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">品牌</label>
        <select
          value={selectedBrand}
          onChange={(e) => handleBrandChange(e.target.value)}
          className="input-field"
          disabled={!selectedCustomer}
        >
          <option value="">选择品牌</option>
          {filteredBrands.map(b => (
            <option key={b.id} value={b.id}>{b.brandName}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">项目</label>
        <select
          value={value.projectId || ''}
          onChange={(e) => handleProjectChange(e.target.value)}
          className="input-field"
          disabled={!selectedBrand}
        >
          <option value="">选择项目</option>
          {filteredProjects.map(p => (
            <option key={p.id} value={p.id}>{p.projectName}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
