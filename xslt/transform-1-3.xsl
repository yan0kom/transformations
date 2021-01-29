<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.1" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:ns1="ns1:test" xmlns:ns2="ns2:test" xmlns:ns3="ns3:test">

  <xsl:output method="xml" indent="yes" encoding="UTF-8" omit-xml-declaration="yes" />

  <!-- <xsl:template match="ns1:input">
    <xsl:element name="ns1:output" namespace="{namespace-uri(.)}">
      <xsl:apply-templates />
    </xsl:element>
  </xsl:template> -->

  <xsl:template match="ns1:input">
    <ns1:output xmlns:ns1="ns1:test" xmlns:ns2="ns2:test" xmlns:ns3="ns3:test">
      <xsl:apply-templates />
    </ns1:output>  
  </xsl:template>

  <xsl:template match="ns1:element">
    <xsl:copy>
      <xsl:attribute name="id">
        <xsl:value-of select="@id" />
      </xsl:attribute>
      <xsl:element name="ns3:concat">
        <xsl:apply-templates select="node()[starts-with(name(), 'ns2:field')]" />
        <xsl:value-of select="@id" />
      </xsl:element>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="node()[starts-with(name(), 'ns2:field')]">
    <xsl:value-of select="." />
  </xsl:template>

</xsl:stylesheet>
