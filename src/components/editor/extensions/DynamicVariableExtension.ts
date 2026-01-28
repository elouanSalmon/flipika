import { Node, mergeAttributes } from '@tiptap/core';
import { ReactRenderer, ReactNodeViewRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import tippy from 'tippy.js';
import type { Instance as TippyInstance } from 'tippy.js';
import { VariableSuggestionMenu } from '../components/VariableSuggestionMenu';
import { DynamicVariableComponent } from '../components/DynamicVariableComponent';

/**
 * Available dynamic variables for reports and templates
 * These will be replaced with actual values when the report is rendered
 */
export const DYNAMIC_VARIABLES = [
    {
        id: 'clientName',
        label: 'Nom du client',
        labelKey: 'variables.clientName',
        category: 'client',
    },
    {
        id: 'reportTitle',
        label: 'Titre du rapport',
        labelKey: 'variables.reportTitle',
        category: 'report',
    },
    {
        id: 'startDate',
        label: 'Date de debut',
        labelKey: 'variables.startDate',
        category: 'period',
    },
    {
        id: 'endDate',
        label: 'Date de fin',
        labelKey: 'variables.endDate',
        category: 'period',
    },
    {
        id: 'dateRange',
        label: 'Periode (debut - fin)',
        labelKey: 'variables.dateRange',
        category: 'period',
    },
    {
        id: 'userName',
        label: 'Nom de l\'utilisateur',
        labelKey: 'variables.userName',
        category: 'user',
    },
    {
        id: 'userEmail',
        label: 'Email de l\'utilisateur',
        labelKey: 'variables.userEmail',
        category: 'user',
    },
    {
        id: 'userCompany',
        label: 'Entreprise de l\'utilisateur',
        labelKey: 'variables.userCompany',
        category: 'user',
    },
    {
        id: 'currentDate',
        label: 'Date du jour',
        labelKey: 'variables.currentDate',
        category: 'other',
    },
] as const;

export type DynamicVariableId = typeof DYNAMIC_VARIABLES[number]['id'];

/**
 * Dynamic Variable Extension for TipTap
 *
 * Allows inserting dynamic variables like [clientName], [startDate], etc.
 * that will be resolved to actual values when the report is rendered.
 *
 * Usage: Type '[' to open the variable suggestion menu
 */
export const DynamicVariableExtension = Node.create({
    name: 'dynamicVariable',

    group: 'inline',

    inline: true,

    selectable: true,

    atom: true,

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: element => element.getAttribute('data-variable-id'),
                renderHTML: attributes => ({
                    'data-variable-id': attributes.id,
                }),
            },
            label: {
                default: null,
                parseHTML: element => element.getAttribute('data-variable-label'),
                renderHTML: attributes => ({
                    'data-variable-label': attributes.label,
                }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-dynamic-variable]',
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        return [
            'span',
            mergeAttributes(HTMLAttributes, {
                'data-dynamic-variable': '',
                'class': 'dynamic-variable-tag',
            }),
            `[${node.attrs.label || node.attrs.id}]`,
        ];
    },

    renderText({ node }) {
        return `[${node.attrs.id}]`;
    },

    addNodeView() {
        return ReactNodeViewRenderer(DynamicVariableComponent);
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                pluginKey: new PluginKey('dynamicVariableSuggestion'),
                editor: this.editor,
                char: '[',
                allowSpaces: false,
                startOfLine: false,
                items: ({ query }: { query: string }) => {
                    return DYNAMIC_VARIABLES.filter(variable =>
                        variable.id.toLowerCase().includes(query.toLowerCase()) ||
                        variable.label.toLowerCase().includes(query.toLowerCase())
                    );
                },
                render: () => {
                    let component: ReactRenderer;
                    let popup: TippyInstance[];

                    return {
                        onStart: (props: any) => {
                            component = new ReactRenderer(VariableSuggestionMenu, {
                                props,
                                editor: props.editor,
                            });

                            if (!props.clientRect) {
                                return;
                            }

                            popup = tippy('body', {
                                getReferenceClientRect: props.clientRect,
                                appendTo: () => document.body,
                                content: component.element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: 'manual',
                                placement: 'bottom-start',
                            });
                        },

                        onUpdate(props: any) {
                            component.updateProps(props);

                            if (!props.clientRect) {
                                return;
                            }

                            popup[0].setProps({
                                getReferenceClientRect: props.clientRect,
                            });
                        },

                        onKeyDown(props: any) {
                            if (props.event.key === 'Escape') {
                                popup[0].hide();
                                return true;
                            }

                            return (component.ref as any)?.onKeyDown(props);
                        },

                        onExit() {
                            popup[0].destroy();
                            component.destroy();
                        },
                    };
                },
                command: ({ editor, range, props }: any) => {
                    // Insert the variable node
                    editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .insertContent({
                            type: 'dynamicVariable',
                            attrs: {
                                id: props.id,
                                label: props.label,
                            },
                        })
                        .run();
                },
            }),
        ];
    },
});
