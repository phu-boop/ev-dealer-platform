// Thêm import dayjs
import dayjs from 'dayjs';

// Trong ContractForm, cập nhật xử lý initialValues
useEffect(() => {
  if (initialValues) {
    const formattedValues = {
      ...initialValues,
      contractDate: initialValues.contractDate ? dayjs(initialValues.contractDate) : null,
      signingDate: initialValues.signingDate ? dayjs(initialValues.signingDate) : null,
    };
    form.setFieldsValue(formattedValues);
  }
}, [initialValues, form]);