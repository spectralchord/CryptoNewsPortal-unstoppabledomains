import {Contract, ethers} from "ethers";
import {ABI, CONTRACT, IPFS_GET_LINK, POLYGON_CHAIN_ID, POLYGON_RPC} from "./Constants";

export const convertNestedObjectToArray = (nestedObj) => Object.keys(nestedObj).map((key) => nestedObj[key]);

export const convertBytesToKB = (bytes) => Math.round(bytes / 1000);

export const handlerDeleteNews = async ({id, signer}) => {
    const myContract = new Contract(CONTRACT, ABI, signer);
    let position = ethers.utils.formatBytes32String(id)
    while (position.length < 66) position += '0';
    try {
        await myContract.deleteNewsByPosition(id).then((sendHash) => {
        })
    } catch (e) {
        console.log("payment fail!");
        console.log(e);
    }
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

export const onSubmitNews = ({data, chainId, setIsLoading, files, user, signer, navigate}) => {
    if (chainId === POLYGON_CHAIN_ID) {
        setIsLoading(true)
        let ipfsSecretKey = '';
        const dataObject = {title: data.title, body: data.body, images: [], domainName: user?.sub ? user?.sub : ''}
        ;(async function () {
            let array = convertNestedObjectToArray(files);
            for (let i = 0; i < array.length; i++) {
                const uploadRes = await toBase64(array[i]);
                let url = 'https://deep-index.moralis.io/api/v2/ipfs/uploadFolder';
                let data = [{"path": i.toString(),"content":uploadRes}];
                let result = await fetch(url, {
                    method: 'POST',
                    headers: {
                        accept: 'application/json',
                        'content-type': 'application/json',
                        'X-API-Key': process.env.REACT_APP_MORALIS_KEY
                    },
                    body: JSON.stringify(data),
                });
                let retImage = await result.json();
                const image_id = retImage[0].path.replace("https://ipfs.moralis.io:2053/ipfs/", "")
                dataObject.images.push(image_id)
            }


            let url = 'https://deep-index.moralis.io/api/v2/ipfs/uploadFolder';
            let data = [{"path":"info","content":dataObject}];
            let result = await fetch(url, {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    'X-API-Key': process.env.REACT_APP_MORALIS_KEY
                },
                body: JSON.stringify(data),
            });
            ipfsSecretKey = (await result.json())[0].path.replace("https://ipfs.moralis.io:2053/ipfs/", "")
        })().then(() => {
            let myContract = new Contract(CONTRACT, ABI, signer);
            ;(async () => {
                try {
                    myContract.addNews(ipfsSecretKey)
                        .then((sendHash) => {
                            setIsLoading(false)
                            navigate('/');
                        }).catch(() => {
                        setIsLoading(false)
                    });
                } catch (e) {
                    console.log("tx fail!");
                    console.log(e);
                }
            })()
        })
    }
}
