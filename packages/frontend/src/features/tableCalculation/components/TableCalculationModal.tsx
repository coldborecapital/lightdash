import {
    CustomFormatType,
    NumberSeparator,
    type CustomFormat,
    type TableCalculation,
} from '@lightdash/common';
import {
    ActionIcon,
    Button,
    Group,
    Modal,
    Stack,
    Tabs,
    TextInput,
    useMantineTheme,
    type ModalProps,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconMaximize, IconMinimize } from '@tabler/icons-react';
import { type FC } from 'react';
import { useToggle } from 'react-use';
import { type ValueOf } from 'type-fest';
import MantineIcon from '../../../components/common/MantineIcon';
import { FormatForm } from '../../../components/Explorer/FormatForm';
import useToaster from '../../../hooks/toaster/useToaster';
import { useExplorerContext } from '../../../providers/ExplorerProvider';
import { getUniqueTableCalculationName } from '../utils';
import { SqlForm } from './SqlForm';

type Props = ModalProps & {
    tableCalculation?: TableCalculation;
    onSave: (tableCalculation: TableCalculation) => void;
};

type TableCalculationFormInputs = {
    name: string;
    sql: string;
    format: CustomFormat;
};

const TableCalculationModal: FC<Props> = ({
    opened,
    tableCalculation,
    onSave,
    onClose,
}) => {
    const theme = useMantineTheme();
    const [isFullscreen, toggleFullscreen] = useToggle(false);

    const { showToastError } = useToaster();

    const tableCalculations = useExplorerContext(
        (context) =>
            context.state.unsavedChartVersion.metricQuery.tableCalculations,
    );

    const form = useForm<TableCalculationFormInputs>({
        initialValues: {
            name: tableCalculation?.displayName || '',
            sql: tableCalculation?.sql || '',
            format: {
                type:
                    tableCalculation?.format?.type || CustomFormatType.DEFAULT,
                round: tableCalculation?.format?.round,
                separator:
                    tableCalculation?.format?.separator ||
                    NumberSeparator.DEFAULT,
                currency: tableCalculation?.format?.currency || 'USD',
                compact: tableCalculation?.format?.compact,
                prefix: tableCalculation?.format?.prefix,
                suffix: tableCalculation?.format?.suffix,
            },
        },
    });

    const handleSubmit = form.onSubmit((data) => {
        const { name, sql } = data;
        try {
            onSave({
                name: getUniqueTableCalculationName(name, tableCalculations),
                displayName: name,
                sql,
                format: data.format,
            });
        } catch (e) {
            showToastError({
                title: 'Error saving',
                subtitle: e.message,
            });
        }
    });

    const getFormatInputProps = (path: keyof CustomFormat) => {
        return form.getInputProps(`format.${path}`);
    };

    const setFormatFieldValue = (
        path: keyof CustomFormat,
        value: ValueOf<CustomFormat>,
    ) => {
        return form.setFieldValue(`format.${path}`, value);
    };

    return (
        <Modal
            opened={opened}
            onClose={() => onClose()}
            size="xl"
            title={
                tableCalculation
                    ? 'Edit table calculation'
                    : 'Add table calculation'
            }
            styles={{
                title: {
                    fontSize: theme.fontSizes.md,
                    fontWeight: 700,
                },
            }}
            fullScreen={isFullscreen}
        >
            <form name="table_calculation" onSubmit={handleSubmit}>
                <Stack>
                    <TextInput
                        mb="sm"
                        label="Name"
                        required
                        placeholder="E.g. Cumulative order count"
                        {...form.getInputProps('name')}
                    />
                    <Tabs
                        defaultValue="sqlEditor"
                        color="indigo"
                        variant="outline"
                        radius="xs"
                        styles={{
                            panel: {
                                borderColor: theme.colors.gray[2],
                                borderWidth: 1,
                                borderStyle: 'solid',
                                borderTop: 'none',
                                height: isFullscreen
                                    ? 'calc(100vh - 260px)'
                                    : '100%',
                            },
                        }}
                    >
                        <Tabs.List>
                            <Tabs.Tab value="sqlEditor">SQL</Tabs.Tab>
                            <Tabs.Tab value="format">Format</Tabs.Tab>
                        </Tabs.List>
                        <Tabs.Panel value="sqlEditor">
                            <SqlForm form={form} isFullScreen={isFullscreen} />
                        </Tabs.Panel>
                        <Tabs.Panel value="format">
                            <FormatForm
                                formatInputProps={getFormatInputProps}
                                setFormatFieldValue={setFormatFieldValue}
                                format={form.values.format}
                            />
                        </Tabs.Panel>
                    </Tabs>

                    <Group position="apart">
                        <ActionIcon
                            variant="outline"
                            onClick={toggleFullscreen}
                        >
                            <MantineIcon
                                icon={
                                    isFullscreen ? IconMinimize : IconMaximize
                                }
                            />
                        </ActionIcon>

                        <Group>
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit"> Save </Button>
                        </Group>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
};

export default TableCalculationModal;
