// DO NOT EDIT!
// Code generated by ffjson <https://github.com/pquerna/ffjson>
// source: msg_init.go
// DO NOT EDIT!

package httpES

import (
	fflib "github.com/pquerna/ffjson/fflib/v1"
)

func (mj *MessageInit) MarshalJSON() ([]byte, error) {
	var buf fflib.Buffer
	if mj == nil {
		buf.WriteString("null")
		return buf.Bytes(), nil
	}
	err := mj.MarshalJSONBuf(&buf)
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
func (mj *MessageInit) MarshalJSONBuf(buf fflib.EncodingBuffer) error {
	if mj == nil {
		buf.WriteString("null")
		return nil
	}
	var err error
	var obj []byte
	_ = obj
	_ = err
	buf.WriteString(`{"event":`)
	fflib.WriteJsonString(buf, string(mj.Event))
	buf.WriteString(`,"ip":`)
	fflib.WriteJsonString(buf, string(mj.IP))
	buf.WriteString(`,"latitude":`)
	fflib.WriteJsonString(buf, string(mj.Latitude))
	buf.WriteString(`,"longitude":`)
	fflib.WriteJsonString(buf, string(mj.Longitude))
	buf.WriteString(`,"caption":`)
	fflib.WriteJsonString(buf, string(mj.Caption))
	buf.WriteByte('}')
	return nil
}
