const client = require('./client');
const {
    RunInstancesCommand,
    DescribeVpcsCommand,
    DescribeSubnetsCommand,
} = require("@aws-sdk/client-ec2");

const createVm = async (event) => {
    const response = { statusCode: 200};

    try{
        
        const { ImageId,InstanceType,KeyName,VpcId, SubnetId } = JSON.parse(event.body);
        const params = {
            ImageId: ImageId,
            InstanceType: InstanceType,
            KeyName: KeyName,
            VpcId: VpcId,
            SubnetId: SubnetId,
            MaxCount: 1,
            MinCount: 1,
        };
        
        const createInstance = await client.send(new RunInstancesCommand(params));

        response.body = JSON.stringify({
            message: "instance created Successfully",
            
            createInstance,
            
        })

    }catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to create",
            errorMsg: e.message,
            errorStack: e.Stack,
        })

    }

    return response; 
}

const listVPCs = async (event) => {
    const response = { statusCode: 200};
    try{
        const VpcIds = JSON.parse(event.body);
        const params = {
            VpcIds: VpcIds,
        };
        const listVpcs = await client.send( new DescribeVpcsCommand(params));
        const vpcsWithTags = listVpcs.Vpcs
            .filter(vpc => vpc.Tags && vpc.Tags.length > 0 )
            .map(vpc => {
                const tag = vpc.Tags.find(tag => tag.Key === 'Name');
                return {
                    VpcId: vpc.VpcId,
                    TagValue: tag ? tag.Value : ''
                }
            })
        response.body = JSON.stringify({
            message:"Succesfully retrieved Vpcs",
            vpcsWithTags,
            listVpcs,
        })
    } catch (e){
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "failed to list Vpcs",
            errorMsg: e.message,
            errorStack: e.Stack,
        })
    }

    return response;
}

const listSubnets = async (event) => {
    const response = { statusCode: 200};
    try{
        const requestBody = JSON.parse(event.body);
        const vpcId = requestBody.vpcId;
        const params = {
            "Filters": [
                {
                  "Name": "vpc-id",
                  "Values": [vpcId]
        
                }
              ]
        };
        
        const listSubnets = await client.send( new DescribeSubnetsCommand(params));
        const subnetsWithTags = listSubnets.Subnets
            .filter(subnet => subnet.Tags && subnet.Tags.length > 0 )
            .map(subnet => {
                const tag = subnet.Tags.find(tag => tag.Key === 'Name');
                return {
                    SubnetId: subnet.SubnetId,
                    TagValue: tag ? tag.Value : ''
                };
            });
        
        
        response.body = JSON.stringify({
            message: "successfully retrieved subnets",
            subnetsWithTags,
          
        })

    }catch (e){
        console.error(e);
        response.statusCode = 500;
        response.body({
            message:"failed to list Subnets",
            errorMsg: e.message,
            errorStack: e.Stack,
        })
    }

    return response;
}

module.exports = {
    createVm,
    listVPCs,
    listSubnets,
};