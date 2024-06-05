import React from 'react';
import { Card } from 'antd';
import { CopyBlock,nord } from 'react-code-blocks';

const CodePreviewComponent = ({ code }) => {

    let cleanedcode = {}
    if(code && code.fields){
        cleanedcode =code.fields.filter(field => field.value !== undefined).map(field => {
            return {"name": field.field, "value": field.value}
        })
    }
    return (
        <Card title="Data gathered from the customer">
            <CopyBlock
                text={JSON.stringify(cleanedcode, null, 2)}
                language="javascript"
                theme={nord}
                showLineNumbers={false}
                wrapLines
            />

        </Card>
    );
};

export default CodePreviewComponent;
