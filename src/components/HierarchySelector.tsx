import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { NativeSelect } from '@/components/ui/native-select'
import { Label } from '@/components/ui/label'

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
        <Label>客户</Label>
        <NativeSelect
          value={selectedCustomer}
          onChange={(e) => handleCustomerChange(e.target.value)}
        >
          <option value="">选择客户</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.customerName}</option>
          ))}
        </NativeSelect>
      </div>

      <div>
        <Label>品牌</Label>
        <NativeSelect
          value={selectedBrand}
          onChange={(e) => handleBrandChange(e.target.value)}
          disabled={!selectedCustomer}
        >
          <option value="">选择品牌</option>
          {filteredBrands.map(b => (
            <option key={b.id} value={b.id}>{b.brandName}</option>
          ))}
        </NativeSelect>
      </div>

      <div>
        <Label>项目</Label>
        <NativeSelect
          value={value.projectId || ''}
          onChange={(e) => handleProjectChange(e.target.value)}
          disabled={!selectedBrand}
        >
          <option value="">选择项目</option>
          {filteredProjects.map(p => (
            <option key={p.id} value={p.id}>{p.projectName}</option>
          ))}
        </NativeSelect>
      </div>
    </div>
  )
}
