import { Modal, Form, Input } from "antd";
import { useState } from "react";

interface CreateFolderModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: { name: string }) => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  visible,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="新建文件夹"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form form={form}>
        <Form.Item
          name="name"
          label="文件夹名称"
          rules={[{ required: true, message: "请输入文件夹名称" }]}
        >
          <Input placeholder="请输入文件夹名称" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateFolderModal;
